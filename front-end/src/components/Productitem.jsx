import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Handbag } from "lucide-react";
import SizeDrawer from "./../pages/SizeDrawer";

const ProductItem = ({ id, originalPrice, sellPrice, isSaleOn, title, product_type, image_url, size, brand, images ,size_stocks}) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const allImages = images && images.length > 0
    ? images.map(img => img.image_url || img)
    : [image_url];

  const handleMouseMove = (e) => {
    if (allImages.length <= 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sectionWidth = rect.width / allImages.length;
    const index = Math.min(Math.floor(x / sectionWidth), allImages.length - 1);
    setActiveIndex(index);
  };

  const handleMouseLeave = () => setActiveIndex(0);

  const handleNavigateToDetail = () => {
    navigate("/productdetail", {
  state: { id, price: isSaleOn ? sellPrice : originalPrice, title, product_type, image_url, size, images, size_stocks },
    });
  };

  return (
    <>
      <div className="w-full bg-white overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer group rounded-xl bg-gray-100"
          onClick={handleNavigateToDetail}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Images — sab render hain, sirf active visible */}
          {allImages.map((img, i) => (
            <img
              key={i}
              src={img || "/img/placeholder.jpg"}
              alt={title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          ))}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

          {/* Dot Indicators */}
          {allImages.length > 1 && (
            <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
              {allImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-200 ${
                    i === activeIndex ? "bg-white w-4" : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ADD Button */}
          <div className="absolute bottom-3 left-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDrawerOpen(true)}
              className="bg-white/95 backdrop-blur-sm text-black rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 transition-all text-xs hover:bg-white hover:shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-200 cursor-pointer"
            >
              <Handbag className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-[10px] font-bold tracking-wide">ADD</span>
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
  product={{ id, originalPrice, sellPrice, isSaleOn, title, product_type, image_url, size, brand, size_stocks }}
  onClose={() => setDrawerOpen(false)}
/>
      )}
    </>
  );
};

export default ProductItem;