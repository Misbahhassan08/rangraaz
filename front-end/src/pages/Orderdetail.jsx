import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import URLS from "../urls";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(URLS.orderDetail(id))
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!order) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Order #{order.order_id}
      </h2>

      <div className="space-y-4">
        <p>
          <span className="font-medium">User ID:</span> {order.user_id}
        </p>
        <p>
          <span className="font-medium">Shipment ID:</span> {order.shipment_id}
        </p>
        <p>
          <span className="font-medium">Tracking ID:</span> {order.tracking_id}
        </p>
        <p>
          <span className="font-medium">Total Price:</span> PKR.{order.total_price}
        </p>
        <p>
          <span className="font-medium">Payment Method:</span> {order.payment_method}
        </p>
        <p>
          <span className="font-medium">Status:</span> {order.status}
        </p>
        <p>
          <span className="font-medium">Created At:</span>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
            <p>{order.shipping_address.name}</p>
            <p>{order.shipping_address.email}</p>
            <p>{order.shipping_address.street1}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.zip}
            </p>
          </div>
        )}

        {/* Products */}
        {order.products && order.products.length > 0 ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Products</h3>
            <ul className="space-y-2">
              {order.products.map((p, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {p.name} – {p.quantity} × Rs.{p.price}
                  </span>
                  <span className="font-medium">
                    Rs. {p.quantity * p.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No products found</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;