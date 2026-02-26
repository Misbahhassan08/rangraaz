import React from "react";
import { useNavigate } from "react-router-dom";
import { Handbag } from "lucide-react";
import productStore from "../store/Productstore";

const ProductItem = ({ id, originalPrice, sellPrice, isSaleOn, title, product_type, image_url, size, onSizeClick, brand }) => {
  const navigate = useNavigate();
  const addToCart = productStore((state) => state.addToCart);

  const handleNavigateToDetail = () => {
    navigate("/productdetail", {
      state: { id, price: isSaleOn ? sellPrice : originalPrice, title, product_type, image_url, size },
    });
  };

  const handleAddToCart = (selectedSize) => {
    const finalPrice = isSaleOn ? sellPrice : originalPrice;
    addToCart({
      id,
      title,
      price: finalPrice,
      image_url,
      product_type,
      size: selectedSize,
      quantity: 1,
    });

    if (onSizeClick) {
      onSizeClick({ id, title, price: finalPrice, image_url, product_type, size: selectedSize });
    }
  };

  return (
    <div className="w-full bg-white overflow-hidden p-1 sm:p-2">
      {/* Clickable image section */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden group cursor-pointer border rounded-lg"
        onClick={handleNavigateToDetail}
      >
        <img
          src={image_url || "/img/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* SALE BADGE */}
        {isSaleOn && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
            SALE
          </span>
        )}

        {/* ADD Button (Mobile/Default) */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleAddToCart(size?.split(",")[0]?.trim() || size)}
            className="bg-white/90 backdrop-blur-sm text-black rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-md flex items-center space-x-1 sm:space-x-2 group-hover:hidden transition-all text-xs sm:text-sm"
          >
            <Handbag className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={1.5} />
            <span className="text-[8px] sm:text-[10px] font-bold">ADD</span>
          </button>
        </div>

        {/* Size Buttons on Hover */}
        {size ? (
          <div
            className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg px-1 sm:px-2 py-1 sm:py-2 flex flex-wrap gap-1 sm:gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            {size.split(",").map((s) => (
              <button
                key={s}
                onClick={() => handleAddToCart(s.trim())}
                className="bg-gray-100 hover:bg-black hover:text-white text-black rounded-md px-1.5 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold transition-colors whitespace-nowrap"
              >
                {s.trim()}
              </button>
            ))}
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px]">
            No size
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="py-2 sm:py-3 px-1">
        <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase tracking-widest mb-0.5 sm:mb-1">{product_type}</p>
        <p className="text-indigo-600 text-[7px] sm:text-[9px] font-bold uppercase tracking-tighter">
          {brand}
        </p>
        <h2 className="text-xs sm:text-sm text-gray-800 font-medium truncate">{title}</h2>

        <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
          {isSaleOn ? (
            <>
              <p className="text-xs sm:text-sm text-red-600 font-bold">PKR. {sellPrice}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 line-through">PKR. {originalPrice}</p>
            </>
          ) : (
            <p className="text-xs sm:text-sm text-black font-bold">PKR. {originalPrice}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;