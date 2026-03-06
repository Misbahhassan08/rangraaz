import React from "react";
import { Trash2 } from 'lucide-react';
import productStore from "../store/Productstore";

const Cartitem = ({ id, price, title, image_url, quantity, size }) => {
  const removeFromCart = productStore((state) => state.removeFromCart);
  const updateQuantity = productStore((state) => state.updateQuantity);

  const incrementQuantity = () => updateQuantity(id, size, quantity + 1);
  const decrementQuantity = () => {
    if (quantity > 1) updateQuantity(id, size, quantity - 1);
  };
  const handleDeleteClick = () => removeFromCart(id, size);

  const formattedPrice = Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="flex flex-row gap-6 p-8">
      <div>
        <img src={image_url || "/img/dress.jpg"} alt={title} width={100} className="rounded-lg object-cover h-28" />
      </div>
      <div className="flex-1">
        <h1 className="text-gray-800 font-medium">{title}</h1>
        {size && <p className="text-xs text-gray-400 mt-0.5">Size: {size}</p>}
        
        <h3 className="text-sm text-purple-600 mt-2 mb-2 font-bold">${formattedPrice}</h3>

        <div className="flex items-center space-x-4 mt-2">
          <label className="text-gray-700 text-sm">Quantity:</label>
          <div className="flex items-center border rounded">
            <button onClick={decrementQuantity} className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 cursor-pointer">−</button>
            <span className="px-2 w-10 text-center text-xs">{quantity}</span>
            <button onClick={incrementQuantity} className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 cursor-pointer">+</button>
          </div>
          <button onClick={handleDeleteClick} className="text-black hover:text-red-700">
            <Trash2 className="w-5 h-5 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cartitem;                   