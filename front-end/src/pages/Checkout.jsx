import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import productStore from "../store/Productstore";
import Squarepayment from "../components/Squarepayment";
import URLS from "../urls";
const Checkout = () => {
  const navigate = useNavigate();
  const cart = productStore((state) => state.cart);
  const getTotalPrice = productStore((state) => state.getTotalPrice);

  const [selectedOption, setSelectedOption] = useState("");
  const [successOrder, setSuccessOrder] = useState(null); // success flag
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    street1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });


  const handleChange = (event) => setSelectedOption(event.target.value);
  const handleBackToCart = () => navigate("/cart");
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

const handlePlaceOrder = async (paymentInfo) => {
 if (!formData.email || !formData.name || !formData.street1 || 
    !formData.city || !formData.state || !formData.zip || !formData.country) {
  alert("Please fill all the fields before placing order!");
  return;
}

if (!selectedOption) {
  alert("Please select a payment method!");
  return;
}  const products = cart.map((item) => ({
      product_id: item.id,
      name: item.title,
      quantity: item.quantity,
      price: item.price,

    }));

    const orderPayload = {
      user: 3,
     total_price: parseFloat(getTotalPrice().toFixed(2)),

      shipment_id: "",
      tracking_id: "",
      shipping_address: formData,
      payment_method:
        selectedOption === "bank"
          ? "CARD"
          : selectedOption === "check"
            ? "PAYPAL"
            : "COD",
      status: "PENDING",
      products: products,
      payment_info: paymentInfo,
    };

    try {
      const response = await fetch(URLS.createOrder, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessOrder(data); // only change state
      } else {
        alert(" Failed to place order: " + data.error);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(" Something went wrong while placing order");
    }
  };

  // Success Page
  if (successOrder) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-green-600 text-center">
            Your Order Has Been Successfully Placed!
          </h2>
          <p className="mt-2 text-gray-600 text-center text-sm">
            Thank you for shopping with us. Here are your order details:
          </p>

          {/* Order Summary */}
          <div className="mt-6 text-sm space-y-2">
            <p><strong>Order ID:</strong> {successOrder.order_id}</p>
            <p><strong>Status:</strong> {successOrder.status}</p>
            <p><strong>Total Price:</strong> ${successOrder.total_price}</p>
            <p><strong>Payment Method:</strong> {successOrder.payment_method}</p>
            <p><strong>Tracking ID:</strong> {successOrder.tracking_id}</p>
            <p><strong>Shipment ID:</strong> {successOrder.shipment_id}</p>
          </div>

          {/*  Shipping Info */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Shipping Information</h3>
            <div className="text-sm mt-2 text-gray-700 space-y-1">
              <p>{successOrder.shipping_address?.name}</p>
              <p>{successOrder.shipping_address?.street1}</p>
              <p>
                {successOrder.shipping_address?.city},{" "}
                {successOrder.shipping_address?.state}{" "}
                {successOrder.shipping_address?.zip}
              </p>
              <p>Email: {successOrder.shipping_address?.email}</p>
            </div>
          </div>

          {/* Products */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Products</h3>
            <div className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
              {successOrder.products?.map((p, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-gray-500">
                      Qty: {p.quantity} × ${p.price}
                    </p>
                  </div>
                  <p className="font-semibold">${p.quantity * p.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  //  Checkout form (shown before order placed)
  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-6">
      {/* Left side form */}
      <div className="w-full lg:w-1/2 p-6">
        <form className="space-y-4">
          <h2 className="text-md">Contact Information</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <h2 className="text-md">Billing Address</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <input
            type="text"
            name="street1"
            placeholder="Street Address"
            value={formData.street1}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <input
            type="text"
            name="zip"
            placeholder="Zip Code"
            value={formData.zip}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </form>
        {/* Payment Options */}
        <div className="mt-8">
          <h2 className="text-md">Payment Options</h2>
          {["bank", "check", "cash"].map((option) => (
            <label key={option} className="block mt-4 text-xs">
              <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={handleChange}
                className="mr-2"
              />
              {option === "bank" && "Card Payment"}
              {option === "check" && "Check Payments"}
              {option === "cash" && "Cash on Delivery"}

              {selectedOption === option && (
                <div className="text-xs text-gray-600 ml-6 mt-1">
                  {option === "bank" && (
                    <Squarepayment
                      applicationId="sandbox-sq0idb-zfj02OZgMyPq-I0GBC-a4g"
                      amount={Math.round(getTotalPrice() * 100)} // convert dollars to cents
                      onPaymentSuccess={(paymentInfo) => handlePlaceOrder(paymentInfo)}
                    />


                  )}

                  {option === "check" &&
                    "Please send a check to Store Address."}
                  {option === "cash" &&
                    "Pay with cash upon delivery."}
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-8 mt-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleBackToCart}
          >
            <ArrowLeft className="text-blue-600 hover:text-blue-800 text-md" />
            <p>Return to cart</p>
          </div>
        </div>
      </div>

      {/* Right Side Cart Summary */}
      <div className="w-full lg:w-1/2 flex justify-center items-start m-6">
        <div className="w-full max-w-sm bg-white border-2 border-gray-200 shadow-xl rounded-xl p-6 h-fit">
          <h3 className="text-md mb-4 text-gray-800">CART TOTALS</h3>
          <div className="flex justify-between text-xs">
            <p>Subtotal</p>
           <p>${getTotalPrice().toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-xs mt-4">
            <p>Total</p>
          <p>${getTotalPrice().toFixed(2)}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => handlePlaceOrder()}
              type="button"
              className="bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition mt-6 w-72"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
