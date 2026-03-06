import React, { useState } from "react";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";
import URLS from "../urls";

const SquarePayment = ({ amount = "1000", userEmail = "", userName = "" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastPayment, setLastPayment] = useState(null);

  const handleCardTokenize = async (token) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(URLS.createPayment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          sourceId: token.token,
          email: userEmail, 
          name: userName    
        }),
      });

      const data = await response.json();

      if (data.success && data.payment) {
        setLastPayment(data.payment);
        setMessage("✅ Payment successful! Check your email for receipt.");
      } else {
        const errorDetail = data.error?.errors?.[0]?.detail || "Payment failed";
        setMessage(` ${errorDetail}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(" Something went wrong with the connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Square Payment</h2>
      <p>Amount to pay: <strong>Rs. {amount}</strong></p>

      <PaymentForm
        applicationId="sandbox-sq0idb-zfj02OZgMyPq-I0GBC-a4g"
        locationId="L3WDNCFTQPMF"
        cardTokenizeResponseReceived={handleCardTokenize}
      >
        <CreditCard
          buttonProps={{
            isLoading: loading,
            text: `Pay Rs. ${amount}`
          }}
        />
      </PaymentForm>

      {message && (
        <p style={{
          marginTop: "10px",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: message.startsWith("✅") ? "#e6f4ea" : "#fce8e6",
          color: message.startsWith("✅") ? "#0b8043" : "#b00020"
        }}>
          {message}
        </p>
      )}

      {lastPayment && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8, background: "#f9f9f9" }}>
          <h3>Order Confirmed!</h3>
          <p><strong>Status:</strong> {lastPayment.status}</p>
          <p><strong>Payment ID:</strong> {lastPayment.id}</p>
          {lastPayment.receipt_url && (
            <a href={lastPayment.receipt_url} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>
              Download Receipt
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default SquarePayment;