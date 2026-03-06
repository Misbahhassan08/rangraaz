import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, MapPin, CreditCard, Hash, Truck, Calendar } from "lucide-react";
import URLS from "../urls";

const statusConfig = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  PROCESSING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  SHIPPED: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

const formatUSD = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(price);
const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    <span className={`text-sm text-gray-800 font-medium ${mono ? "font-mono" : ""}`}>
      {value || <span className="text-gray-300 font-normal">—</span>}
    </span>
  </div>
);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(URLS.orderDetail(id))
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!order)
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm">Loading order...</p>
        </div>
      </div>
    );

  const cfg = statusConfig[order.status] || statusConfig.PENDING;
  const totalCalc = order.products?.reduce((sum, p) => sum + p.quantity * p.price, 0) || 0;

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Order <span className="text-indigo-600">#{order.order_id}</span>
            </h2>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Calendar size={11} />
            {new Date(order.created_at).toLocaleString("en-US", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left Column — Order Info + Shipping */}
        <div className="col-span-2 space-y-4">
          {/* Order Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Hash size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">Order Information</h3>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="User ID" value={order.user_id} />
              <InfoRow label="Shipment ID" value={order.shipment_id} mono />
              <InfoRow label="Tracking ID" value={order.tracking_id} mono />
              <InfoRow label="Payment Method" value={order.payment_method} />
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <MapPin size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">Shipping Address</h3>
            </div>
            {order.shipping_address && (order.shipping_address.name || order.shipping_address.street1) ? (
              <div className="px-4 py-3 space-y-0.5">
                {order.shipping_address.name && (
                  <p className="text-sm font-semibold text-gray-800">{order.shipping_address.name}</p>
                )}
                {order.shipping_address.email && (
                  <p className="text-xs text-gray-400">{order.shipping_address.email}</p>
                )}
                {order.shipping_address.street1 && (
                  <p className="text-sm text-gray-600 pt-1">{order.shipping_address.street1}</p>
                )}
                <p className="text-sm text-gray-600">
                  {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip]
                    .filter(Boolean).join(", ")}
                </p>
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-gray-300">No address on file</p>
            )}
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Package size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">Products</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {order.products?.length || 0} items
              </span>
            </div>
            {order.products && order.products.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {order.products.map((p, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.quantity} × {formatUSD(p.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatUSD(p.quantity * p.price)}
                    </span>
                  </div>
                ))}
                {/* Total row */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatUSD(order.total_price || totalCalc)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-gray-300">No products found</p>
            )}
          </div>
        </div>

        {/* Right Column — Summary */}
        <div className="space-y-4">
          {/* Price Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <CreditCard size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">Payment Summary</h3>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatUSD(totalCalc)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-500">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatUSD(order.total_price || totalCalc)}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">Method</span>
                <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
                  {order.payment_method}
                </span>
              </div>
            </div>
          </div>

          {/* Shipment Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Truck size={14} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">Shipment</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Shipment ID</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {order.shipment_id || <span className="text-gray-300">Not assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Tracking ID</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {order.tracking_id || <span className="text-gray-300">Not assigned</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
