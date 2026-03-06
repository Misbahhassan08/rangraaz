import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import URLS from "../urls";
import { Trash2, Package, ChevronDown, X, CheckCircle2 } from "lucide-react";

const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const SHIPPO_TOKEN = import.meta.env.VITE_SHIPPO_TOKEN;

const statusConfig = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  PROCESSING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  SHIPPED: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const OrdersTable = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    from_name: "", from_street1: "", from_city: "", from_state: "",
    from_zip: "", from_country: "", from_email: "",
    to_name: "", to_street1: "", to_city: "", to_state: "",
    to_zip: "", to_country: "", to_email: "",
    parcel_length: "", parcel_width: "", parcel_height: "", parcel_weight: "",
  });
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);

  const formatUSD = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(price);
  useEffect(() => {
    fetch(URLS.allOrders)
      .then((res) => res.json())
      .then((data) => setOrders(data.data || []))
      .catch((err) => console.log("Fetch Error:", err));
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
    );
    fetch(URLS.updateOrderStatus(orderId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch((err) => console.error("Error updating status:", err));
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const res = await fetch(URLS.deleteOrder(orderId), { method: "DELETE" });
      const data = await res.json();
      if (data.success) setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
      else alert("Error: " + data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateShipment = async () => {
    setLoading(true);
    try {
      const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `ShippoToken ${SHIPPO_TOKEN}` },
        body: JSON.stringify({
          address_from: { name: formData.from_name, street1: formData.from_street1, city: formData.from_city, state: formData.from_state, zip: formData.from_zip, country: formData.from_country, email: formData.from_email },
          address_to: { name: formData.to_name, street1: formData.to_street1, city: formData.to_city, state: formData.to_state, zip: formData.to_zip, country: formData.to_country, email: formData.to_email },
          parcels: [{ length: formData.parcel_length, width: formData.parcel_width, height: formData.parcel_height, distance_unit: "in", weight: formData.parcel_weight, mass_unit: "lb" }],
        }),
      });
      const shipmentData = await shipmentRes.json();
      if (!shipmentData.object_id) { alert("Shipment creation failed!"); return; }
      setCurrentShipmentId(shipmentData.object_id);
      const rateRes = await fetch(`https://api.goshippo.com/shipments/${shipmentData.object_id}/rates/`, { headers: { Authorization: `ShippoToken ${SHIPPO_TOKEN}` } });
      const rateData = await rateRes.json();
      if (!rateData.results?.length) { alert("No rates available."); return; }
      setRates(rateData.results);
      setStep("rates");
    } catch (err) { console.error(err); alert("Error creating shipment."); }
    finally { setLoading(false); }
  };

  const handleBuyLabel = async () => {
    if (!selectedRate) { alert("Please select a rate first!"); return; }
    setLoading(true);
    try {
      const transRes = await fetch("https://api.goshippo.com/transactions/", {
        method: "POST",
        headers: { Authorization: `ShippoToken ${SHIPPO_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rate: selectedRate, label_file_type: "PDF_4x6", async: false }),
      });
      const transData = await transRes.json();
      if (transData.status === "SUCCESS") {
        await fetch(URLS.updateOrderShipment(selectedOrder.order_id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipment_id: currentShipmentId, tracking_id: transData.tracking_number }),
        });
        const refreshed = await fetch(URLS.allOrders).then((r) => r.json());
        setOrders(refreshed.data || []);
        setShowForm(false);
        navigate("/dashboard/tracking", { state: { tracking_number: transData.tracking_number, label_url: transData.label_url, tracking_url_provider: transData.tracking_url_provider } });
      } else { alert("Failed to create label."); }
    } catch (err) { console.error(err); alert("Error creating label."); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-gray-400";

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Order Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "7%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["Order ID", "User", "Shipment ID", "Tracking ID", "Amount", "Payment", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.order_id}
                onClick={() => navigate(`/dashboard/orders/${order.order_id}`)}
                className="cursor-pointer hover:bg-indigo-50/40 transition-colors group"
              >
                {/* Order ID */}
                <td className="px-3 py-3">
                  <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                    #{order.order_id}
                  </span>
                </td>

                {/* User ID */}
                <td className="px-3 py-3 text-gray-600 text-xs">{order.user_id}</td>

                {/* Shipment ID */}
                <td className="px-3 py-3">
                  <span className="text-xs text-gray-500 font-mono truncate block" title={order.shipment_id}>
                    {order.shipment_id || <span className="text-gray-300 not-italic">—</span>}
                  </span>
                </td>

                {/* Tracking ID */}
                <td className="px-3 py-3">
                  <span className="text-xs text-gray-500 font-mono truncate block" title={order.tracking_id}>
                    {order.tracking_id || <span className="text-gray-300">—</span>}
                  </span>
                </td>

                {/* Price */}
                <td className="px-3 py-3">
                  <span className="font-semibold text-emerald-600 text-xs">
                    {formatUSD(order.total_price)}
                  </span>
                </td>

                {/* Payment */}
                <td className="px-3 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                    {order.payment_method}
                  </span>
                </td>

                {/* Date */}
                {/* Date Column - Table Body */}
                <td className="px-3 py-3 text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                  <br />
                  <span className="text-gray-300">
                    {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      className={`appearance-none w-full text-xs font-medium px-2 py-1 pr-6 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${statusConfig[order.status]?.bg || "bg-gray-50"} ${statusConfig[order.status]?.text || "text-gray-600"}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowForm(true);
                        setStep("form");
                        setRates([]);
                        setSelectedRate(null);
                        setCurrentShipmentId(null);
                        const addr = order.shipping_address || {};
                        setFormData((prev) => ({
                          ...prev,
                          to_name: addr.name || "", to_street1: addr.street1 || "",
                          to_city: addr.city || "", to_state: addr.state || "",
                          to_zip: addr.zip || "", to_country: addr.country || "",
                          to_email: addr.email || "",
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      <Package size={11} />
                      Ship
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.order_id)}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No orders found.</div>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {step === "form" ? "Create Shipment" : "Select Shipping Rate"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Order #{selectedOrder?.order_id}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              {step === "form" && (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    {["From", "To"].map((dir) => {
                      const prefix = dir.toLowerCase();
                      return (
                        <div key={dir}>
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                            {dir} Address
                          </p>
                          <div className="space-y-2">
                            {["name", "street1", "city", "state", "zip", "country", "email"].map((field) => (
                              <input
                                key={field}
                                name={`${prefix}_${field}`}
                                value={formData[`${prefix}_${field}`]}
                                onChange={handleChange}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                className={inputCls}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Parcel Details</p>
                    <div className="grid grid-cols-4 gap-2">
                      {["length", "width", "height", "weight"].map((f) => (
                        <input
                          key={f}
                          name={`parcel_${f}`}
                          value={formData[`parcel_${f}`]}
                          onChange={handleChange}
                          placeholder={`${f.charAt(0).toUpperCase() + f.slice(1)} ${f === "weight" ? "(lb)" : "(in)"}`}
                          className={inputCls}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateShipment}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition font-medium"
                    >
                      {loading ? "Processing..." : "Get Rates →"}
                    </button>
                  </div>
                </>
              )}

              {step === "rates" && (
                <>
                  <div className="space-y-2">
                    {rates.map((r) => (
                      <div
                        key={r.object_id}
                        onClick={() => setSelectedRate(r.object_id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${selectedRate === r.object_id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-100 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${selectedRate === r.object_id ? "border-indigo-500" : "border-gray-300"}`}>
                            {selectedRate === r.object_id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {r.provider} · {r.servicelevel.name}
                            </p>
                            <p className="text-xs text-gray-400">{r.duration_terms || "Delivery time not specified"}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">${r.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-5">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      Cancel
                    </button>
                    <button
                      onClick={handleBuyLabel}
                      disabled={!selectedRate || loading}
                      className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      {loading ? "Processing..." : "Confirm & Buy Label"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
