// TrackingPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Trackingpage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tracking_number, label_url, tracking_url_provider } = location.state || {};

  if (!tracking_number) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">No tracking info available.</h2>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Shipment Details</h2>
      <p className="mb-2"><strong>Tracking Number:</strong> {tracking_number}</p>
      <p className="mb-2">
        <strong>Label PDF:</strong>{" "}
        <a href={label_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          View Label
        </a>
      </p>
      <p className="mb-2">
        <strong>Track Online:</strong>{" "}
        <a href={tracking_url_provider} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          Track Shipment
        </a>
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-gray-300 rounded-md mt-4"
      >
        Back to Orders
      </button>
    </div>
  );
};

export default Trackingpage;
