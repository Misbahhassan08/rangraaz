
import React from "react";

const AddToCartDialog = ({ onContinue, onGoToCart }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-xl font-semibold mb-4">Item Added to Cart!</h2>
        <p className="text-gray-700 mb-6">
          Your product has been successfully added to your cart.
        </p>
        <div className="flex justify-around space-x-4">
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={onGoToCart}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartDialog;