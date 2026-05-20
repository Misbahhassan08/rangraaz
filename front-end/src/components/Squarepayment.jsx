import React, { useState } from "react";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";
import URLS from "../urls";

const SquarePayment = ({
  amount,
  userEmail = "",
  userName = "",
  onPaymentSuccess,  
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCardTokenize = async (tokenResult) => {
    // ✅ Check tokenization errors first
    if (tokenResult.status !== "OK") {
      const errors = tokenResult.errors?.map(e => e.message).join(", ");
      setMessage(`❌ Card error: ${errors}`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(URLS.createPayment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          sourceId: tokenResult.token,
          email: userEmail,
          name: userName,
        }),
      });

      const data = await response.json();

      if (data.success && data.payment) {
        setMessage("✅ Payment confirmed! Placing your order...");
        onPaymentSuccess?.(data.payment);
      } else {
        const errorDetail =
          data.error?.errors?.[0]?.detail ||
          data.message ||
          "Payment failed. Please try again.";
        setMessage(`❌ ${errorDetail}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Square Payment</h2>
      <p>Amount to pay: <strong>{displayAmount}</strong></p>

      <PaymentForm
        applicationId="sandbox-sq0idb-rnOm7jeBKql3BQ-GyEMqGg"
        locationId="L3WDNCFTQPMF"   
        cardTokenizeResponseReceived={handleCardTokenize}
      >
        <CreditCard
          buttonProps={{ isLoading: loading }}
        >
          {loading ? "Processing..." : `Pay ${displayAmount}`}
        </CreditCard>
      </PaymentForm>

      {message && (
        <p style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 5,
          backgroundColor: message.startsWith("✅") ? "#e6f4ea" : "#fce8e6",
          color: message.startsWith("✅") ? "#0b8043" : "#b00020",
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default SquarePayment;