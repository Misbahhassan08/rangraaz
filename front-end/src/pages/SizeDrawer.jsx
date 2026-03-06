import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import productStore from "../store/Productstore";
import { useNavigate } from "react-router-dom";


const SizeDrawer = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const addToCart = productStore((state) => state.addToCart);
  const navigate = useNavigate();

  if (!product) return null;

  const sizes = product.size ? product.size.split(",").map(s => s.trim()) : [];
  const finalPrice = product.isSaleOn ? product.sellPrice : product.originalPrice;

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 0) return;
    addToCart({
      id: product.id,
      title: product.title,
      price: finalPrice,
      image_url: product.image_url,
      product_type: product.product_type,
      size: selectedSize || "Free Size",
      quantity: 1,
    });
    onClose();

  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 ">

          <button onClick={onClose}>
            <X size={20} className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Product Info */}

        <div className="px-6 py-5">
          <img
            src={product.image_url || "/img/placeholder.jpg"}
            alt={product.title}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.product_type}</p>
            <h3 className="text-sm font-semibold text-gray-800 mt-1">{product.title}</h3>
            <div className="mt-1">
              {product.isSaleOn ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-red-600">
                    PKR. {Number(product.sellPrice).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 line-through">
                    PKR. {Number(product.originalPrice).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-800">
                  PKR. {Number(product.originalPrice).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="px-6 py-5 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Size: <span className="text-black">{selectedSize || "—"}</span>
          </p>
          {sizes.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 rounded-lg border-2 text-sm font-bold transition-all ${selectedSize === s
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No sizes available</p>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="px-6 py-5 ">
          <button
            onClick={handleAddToCart}
            disabled={sizes.length > 0 && !selectedSize}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default SizeDrawer;