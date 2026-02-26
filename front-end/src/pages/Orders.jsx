import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import URLS from "../urls";

const statusOptions = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const SHIPPO_TOKEN = "shippo_test_b7c1fed50ad555704dfb8fe0a82fd60f69ab42e0";

const OrdersTable = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    from_name: "",
    from_street1: "",
    from_city: "",
    from_state: "",
    from_zip: "",
    from_country: "",
    from_email: "",
    to_name: "",
    to_street1: "",
    to_city: "",
    to_state: "",
    to_zip: "",
    to_country: "",
    to_email: "",
    parcel_length: "",
    parcel_width: "",
    parcel_height: "",
    parcel_weight: "",
  });

  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [currentShipmentId, setCurrentShipmentId] = useState(null);
  const [step, setStep] = useState("form");

  // Fetch orders
  useEffect(() => {
    fetch(URLS.allOrders)
      .then(res => res.json())
      .then(data => {
        setOrders(data.data || []);
      })
      .catch(err => console.log("Fetch Error:", err));
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.order_id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    fetch(URLS.updateOrderStatus(orderId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch((err) => console.error("Error updating status:", err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // STEP 1: Create shipment
  const handleCreateShipment = async () => {
    try {
      const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
       Authorization: `ShippoToken ${SHIPPO_TOKEN}` ,
        },

        body: JSON.stringify({
          address_from: {
            name: formData.from_name,
            street1: formData.from_street1,
            city: formData.from_city,
            state: formData.from_state,
            zip: formData.from_zip,
            country: formData.from_country,
            email: formData.from_email,
          },
          address_to: {
            name: formData.to_name,
            street1: formData.to_street1,
            city: formData.to_city,
            state: formData.to_state,
            zip: formData.to_zip,
            country: formData.to_country,
            email: formData.to_email,
          },
          parcels: [
            {
              length: formData.parcel_length,
              width: formData.parcel_width,
              height: formData.parcel_height,
              distance_unit: "in",
              weight: formData.parcel_weight,
              mass_unit: "lb",
            },
          ],
        }),
      });

      const shipmentData = await shipmentRes.json();
      console.log("Shipment Response:", shipmentData);

      if (!shipmentData.object_id) {
        alert("Shipment creation failed! Check console.");
        return;
      }

      setCurrentShipmentId(shipmentData.object_id);
      alert(`Shipment created! ID: ${shipmentData.object_id}`);

      // STEP 2: Fetch rates for this shipment
      const rateRes = await fetch(
        `https://api.goshippo.com/shipments/${shipmentData.object_id}/rates/`,
       { headers: { Authorization: `ShippoToken ${SHIPPO_TOKEN}` } }
      );
      const rateData = await rateRes.json();
      console.log("Rates Response:", rateData);

      if (!rateData.results || rateData.results.length === 0) {
        alert("No rates available for this shipment.");
        return;
      }

      setRates(rateData.results);
      setStep("rates"); // show rates selection UI
    } catch (err) {
      console.error(err);
      alert("Error creating shipment or fetching rates.");
    }
  };

  // STEP 3: Purchase label
  // Inside OrdersTable component
  const handleBuyLabel = async () => {
    if (!selectedRate) {
      alert("Please select a rate first!");
      return;
    }

    try {
      const transRes = await fetch("https://api.goshippo.com/transactions/", {
        method: "POST",
        headers: {
           Authorization: `ShippoToken ${SHIPPO_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate: selectedRate,
          label_file_type: "PDF_4x6",
          async: false,
        }),
      });

      const transData = await transRes.json();
      console.log("Transaction Response:", transData);

     if (transData.status === "SUCCESS") {
  
await fetch(URLS.updateOrderShipment(selectedOrder.order_id), {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    shipment_id: currentShipmentId,
    tracking_id: transData.tracking_number,
  }),
});

  const refreshed = await fetch(URLS.allOrders).then(r => r.json());
  setOrders(refreshed.data || []);

  setShowForm(false);
  navigate("/dashboard/tracking", {
    state: {
      tracking_number: transData.tracking_number,
      label_url: transData.label_url,
      tracking_url_provider: transData.tracking_url_provider,
    },
  });
}else {
        console.error("Transaction failed:", transData);
        alert("Failed to create label. Check console for details.");
      }
    } catch (err) {
      console.error("Error purchasing label:", err);
      alert("Error creating label. See console.");
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Order Details</h2>

      {/* TABLE SAME AS BEFORE */}
      <div className="table-responsive overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="table min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">User ID</th>
              <th className="px-6 py-3 text-left">Shipment ID</th>
              <th className="px-6 py-3 text-left">Tracking ID</th>
              <th className="px-6 py-3 text-left">Total Price</th>
              <th className="px-6 py-3 text-left">Payment Method</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.order_id}
                onClick={() => navigate(`/dashboard/orders/${order.order_id}`)}
                className="cursor-pointer hover:bg-gray-50 transition"
              >                <td className="px-6 py-4">{order.order_id}</td>
                <td className="px-6 py-4">{order.user_id}</td>
                <td className="px-6 py-4">{order.shipment_id || "-"}</td>
                <td className="px-6 py-4">{order.tracking_id || "-"}</td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  Rs. {order.total_price}
                </td>
                <td className="px-6 py-4">{order.payment_method}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(order.order_id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 bg-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowForm(true);
                      setStep("form");
                      setRates([]);
                      setSelectedRate(null);
                      setCurrentShipmentId(null);

                      // Auto-fill to_ fields from saved shipping_address
                      const addr = order.shipping_address || {};
                      setFormData((prev) => ({
                        ...prev,
                        to_name: addr.name || "",
                        to_street1: addr.street1 || "",
                        to_city: addr.city || "",
                        to_state: addr.state || "",
                        to_zip: addr.zip || "",
                        to_country: addr.country || "",
                        to_email: addr.email || "",
                      }));
                    }}
                    className="bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20 px-10 py-1 rounded-md hover:bg-blue-700"
                  >
                    Create Shipment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {step === "form" && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Create Shipment for Order #{selectedOrder?.order_id}
                </h3>

                {/* Address Inputs */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">From Address</h4>
                    {["name", "street1", "city", "state", "zip", "country", "email"].map(
                      (field) => (
                        <input
                          key={field}
                          name={`from_${field}`}
                          value={formData[`from_${field}`]}
                          onChange={handleChange}
                          placeholder={`From ${field}`}
                          className="border w-full px-3 py-2 mb-2 rounded-md"
                        />
                      )
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">To Address</h4>
                    {["name", "street1", "city", "state", "zip", "country", "email"].map(
                      (field) => (
                        <input
                          key={field}
                          name={`to_${field}`}
                          value={formData[`to_${field}`]}
                          onChange={handleChange}
                          placeholder={`To ${field}`}
                          className="border w-full px-3 py-2 mb-2 rounded-md"
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Parcel Details */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Parcel Details</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {["length", "width", "height", "weight"].map((f) => (
                      <input
                        key={f}
                        name={`parcel_${f}`}
                        value={formData[`parcel_${f}`]}
                        onChange={handleChange}
                        placeholder={`${f} (in)`}
                        className="border px-3 py-2 rounded-md"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateShipment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Continue to Rates
                  </button>
                </div>
              </>
            )}

            {step === "rates" && (
              <>
                <h3 className="text-xl font-semibold mb-4">Select a Rate</h3>
                {rates.map((r) => (
                  <div
                    key={r.object_id}
                    onClick={() => setSelectedRate(r.object_id)}
                    className={`border rounded-md p-3 mb-2 cursor-pointer ${selectedRate === r.object_id ? "border-blue-500 bg-blue-50" : ""
                      }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {r.provider} - {r.servicelevel.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {r.duration_terms || "No delivery time info"}
                        </p>
                      </div>
                      <p className="font-semibold">${r.amount}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuyLabel}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Confirm & Buy Label
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
