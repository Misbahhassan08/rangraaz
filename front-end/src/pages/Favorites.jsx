import React from "react";
import productStore from "../store/Productstore";
import ProductItem from "../components/ProductItem";
import { HeartOff } from "lucide-react";

const Favorites = () => {
  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 font-sans">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-widest uppercase text-gray-800">My Favorites</h1>
        <div className="w-16 h-0.5 bg-gray-300 mx-auto mt-3 rounded-full"></div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-32">
          <HeartOff size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No favorites yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-14">
          {favorites.map((product) => (
            <div key={product.id} className="relative group">
              <button
                onClick={() => toggleFavorite(product)}
                className="absolute top-3 right-3 z-10 p-2 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="Remove from favorites"
              >
                <HeartOff className="text-red-400" size={16} />
              </button>
              <ProductItem
                {...product}
                title={product.product_name}
                originalPrice={product.original_price}
                sellPrice={product.sell_price}
                isSaleOn={product.is_sale_on}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;