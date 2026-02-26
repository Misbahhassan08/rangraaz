import React, { useState } from "react";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";
import URLS from "../urls";


const SquarePayment = ({ amount = "10.00" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastPayment, setLastPayment] = useState(null);

  const handleCardTokenize = async (token) => {
    setLoading(true);
    setMessage("");

    try {
      fetch(URLS.createPayment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, sourceId: token.token }),
      });

      const data = await response.json();

      if (data.success && data.payment) {
        setLastPayment(data.payment);
        setMessage("✅ Payment successful!");
      } else {
        setMessage(` Payment failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(" Something went wrong with payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>Square Payment</h2>
      <p>Sandbox mode — use test cards like 4111 1111 1111 1111</p>

      <PaymentForm
        applicationId="sandbox-sq0idb-zfj02OZgMyPq-I0GBC-a4g"
        locationId="L3WDNCFTQPMF"
        cardTokenizeResponseReceived={handleCardTokenize}
      >
        <CreditCard />
      </PaymentForm>

      {loading && <p style={{ color: "#555" }}>Processing payment...</p>}

      {message && (
        <p style={{ color: message.startsWith("✅") ? "#0b8043" : "#b00020" }}>{message}</p>
      )}

      {lastPayment && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8, background: "#f9f9f9" }}>
          <h3>Payment Details</h3>
          <p>
            <strong>Amount Paid:</strong> ${(lastPayment.amount_money.amount / 100).toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {lastPayment.status}
          </p>
          <p>
            <strong>Receipt Number:</strong> {lastPayment.receipt_number}
          </p>
          {lastPayment.receipt_url && (
            <p>
              <a href={lastPayment.receipt_url} target="_blank" rel="noreferrer" style={{ color: "#0070f3", textDecoration: "underline" }}>
                View Receipt
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SquarePayment;
