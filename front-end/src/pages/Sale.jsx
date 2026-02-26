import React, { useState, useEffect } from "react";
import ProductItem from "../components/ProductItem";
import productStore from "../store/Productstore";
import { HeartPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import URLS from "../urls";

const Sale = () => {
  const [saleProducts, setSaleProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);
  const navigate = useNavigate();

  // Fetch only products where is_sale_on is true
  const fetchSaleProducts = async () => {
    try {
     const response = await fetch(URLS.saleProducts);
      const data = await response.json();
      setSaleProducts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch sale products:", error);
    }
  };

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const isFavorited = (id) => favorites.some((item) => item.id === id);

  const handleSizeClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  return (
    <div className="p-10">
      <div className="mb-8  pb-4">
        <h1 className="text-2xl font-black text-red-600 tracking-widest italic">FLASH SALE %</h1>
        <p className="text-gray-500 text-xs mt-1">Limited time offers on your favorite collections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {saleProducts.length > 0 ? (
          saleProducts.map((product) => (
            <div key={product.id} className="relative group">
              <HeartPlus
                onClick={() =>
                  toggleFavorite({
                    id: product.id,
                    title: product.product_name,
                    price: product.sell_price,
                    image_url: product.image_url,
                    product_type: product.product_type,
                    size: product.size,
                  })
                }
                className={`absolute top-4 right-4 z-10 cursor-pointer w-6 h-6 transition-colors ${
                  isFavorited(product.id) ? "text-red-500" : "text-gray-400"
                } opacity-80 hover:opacity-100`}
                strokeWidth={1.25}
              />

              <ProductItem
                id={product.id}
                product_type={product.product_type}
                title={product.product_name}
                originalPrice={product.original_price}
                sellPrice={product.sell_price}
                isSaleOn={product.is_sale_on}
                image_url={product.image_url}
                size={product.size}
                onSizeClick={() => handleSizeClick(product)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-gray-400 italic">No products currently on sale. Stay tuned!</p>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="relative bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center border border-gray-200">
            <button onClick={() => setOpenDialog(false)} className="absolute top-3 right-3 text-gray-500">✕</button>
            <h2 className="text-mg font-bold mb-4 text-green-600">Successfully added to cart!</h2>
            <p className="text-gray-600 mb-6 text-xs">{selectedProduct?.product_name} added to cart!</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setOpenDialog(false)} className="py-4 rounded-3xl bg-gray-200 text-xs">CONTINUE SHOPPING</button>
              <button onClick={() => navigate("/checkout")} className="py-4 rounded-3xl bg-purple-400 text-white text-xs">CHECKOUT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sale;