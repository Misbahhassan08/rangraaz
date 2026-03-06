import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Handbag } from "lucide-react";
import SizeDrawer from "./../pages/SizeDrawer";

const ProductItem = ({ id, originalPrice, sellPrice, isSaleOn, title, product_type, image_url, size, brand }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigateToDetail = () => {
    navigate("/productdetail", {
      state: { id, price: isSaleOn ? sellPrice : originalPrice, title, product_type, image_url, size },
    });
  };

  return (
    <>
      <div className="w-full bg-white overflow-hidden">
        {/* Image */}
        <div
          className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer group rounded-xl bg-gray-100"
          onClick={handleNavigateToDetail}
        >
          <img
            src={image_url || "/img/placeholder.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Subtle dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

          {/* ADD Button */}
          <div
            className="absolute bottom-3 left-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              className="bg-white/95 backdrop-blur-sm text-black rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 transition-all text-xs hover:bg-white hover:shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-200"
            >
              <Handbag className="w-3.5 h-3.5 cursor-pointer" strokeWidth={1.5} />
              <span className="text-[10px] font-bold tracking-wide cursor-pointer">ADD</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-2.5 pb-1 px-0.5">
          <p className="text-gray-400 text-[9px] uppercase tracking-widest mb-0.5">{product_type}</p>
          <h2 className="text-sm text-gray-800 font-medium truncate leading-snug">{title}</h2>
          <div className="mt-1.5 flex items-center gap-2">
            {isSaleOn ? (
              <>
                <p className="text-sm text-red-500 font-bold">
                  $ {Number(sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-300 line-through">
                  $ {Number(originalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-800 font-semibold">
                $ {Number(originalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <SizeDrawer
          product={{ id, originalPrice, sellPrice, isSaleOn, title, product_type, image_url, size, brand }}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
};

export default ProductItem;
