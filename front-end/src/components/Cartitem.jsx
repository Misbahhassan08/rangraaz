import React, { useState } from "react";
import { Trash2 } from 'lucide-react';
import productStore from "../store/Productstore";



const Cartitem = ({ id, price, title, description, image_url, quantity }) => {
  const removeFromCart = productStore((state) => state.removeFromCart);
  const updateQuantity = productStore((state) => state.updateQuantity);



  const incrementQuantity = () => {
    updateQuantity(id, quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    }
  };

  const handleDeleteClick = () => {
    console.log(`Attempting to remove item with ID: ${id}`);
    removeFromCart(id);
  };


  return (
    <div className="flex fle-row gap-6 p-8">
      <div>
        <img src="/img/dress.jpg" alt="dress" width={100} />
      </div>
      <div className="flex-1 ">
        <h1 className=" text-gray-800">
          {title}</h1>
        <h3 className="text-sm text-purple-600 mt-3 mb-3">{price}</h3>
        <p className="text-gray-600 text-xs tracking-wide">
          {description}
        </p>

        <div className="flex items-center space-x-4 mt-2">
          <label className="text-gray-700 text-md ">Quantity:</label>
          <div className="flex items-center border rounded">
            <button
              onClick={decrementQuantity}
              className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              −
            </button>
            <span className="px-2 w-10 text-center text-xs">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              +
            </button>
          </div>

          <button
            onClick={handleDeleteClick}
            className="text-black hover:text-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>


        </div>
      </div>



    </div>
  )
}

export default Cartitem
