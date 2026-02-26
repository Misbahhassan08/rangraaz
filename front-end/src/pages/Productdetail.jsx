import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import productStore from "../store/Productstore";
import { HeartPlus, Handbag } from "lucide-react";

const Productdetail = () => {
  const quantity = productStore((state) => state.quantity);
  const increaseQuantity = productStore((state) => state.increaseQuantity);
  const decreaseQuantity = productStore((state) => state.decreaseQuantity);
  const addToCart = productStore((state) => state.addToCart);

  const [addedMessage, setAddedMessage] = React.useState("");

  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);

  const navigate = useNavigate();
  const location = useLocation();

  const { id, price, title, product_type, image_url, size } = location.state || {};

  const [selectedSize, setSelectedSize] = React.useState(null);

  const availableSizes = size ? size.split(",").map(s => s.trim()) : [];
  const formatPrice = (price) => Number(price).toLocaleString('en-PK');

  const handleAddToCart = () => {
    if (!selectedSize && availableSizes.length > 0) {
      setAddedMessage("Please select a size.");
      setTimeout(() => setAddedMessage(""), 2000);
      return;
    }
    const productToAdd = {
      id,
      title,
      price,
      image_url,
      product_type,
      size: selectedSize,
      quantity,
    };

    addToCart(productToAdd);
    setAddedMessage("Added to cart!");

    setTimeout(() => {
      setAddedMessage("");
      navigate("/cart");
    }, 500);
  };

  const isFavorited = favorites.some((item) => item.id === id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 p-4 sm:p-6 max-w-7xl mx-auto font-sans min-h-screen">
      {/* Image Section */}
      <div className="flex-1 flex justify-center items-start lg:sticky lg:top-6">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <InnerImageZoom
            src={image_url}
            zoomSrc={image_url}
            zoomType="hover"
            zoomPreload={true}
            zoomScale={2}
            alt={title}
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 space-y-5 sm:space-y-6">
        {/* Header with Title and Favorite */}
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-wide leading-tight">
            {title}
          </h1>
          <HeartPlus
            onClick={() =>
              toggleFavorite({
                id,
                title,
                price,
                image_url,
                product_type,
                size,
              })
            }
            className={`cursor-pointer w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 transition-colors duration-200 ${
              isFavorited ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-gray-600"
            }`}
            strokeWidth={1.5}
          />
        </div>

        {/* Price */}
        <h3 className="text-sm sm:text-base font-bold text-purple-700">
          PKR {formatPrice(price)}
        </h3>

        {/* Product Type */}
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {product_type}
        </p>

        {/* Size Selection Section */}
        {availableSizes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Select Size:</h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center 
                    text-sm sm:text-base font-medium border border-gray-300 rounded-xl
                    hover:border-black transition-all duration-200
                    ${
                      selectedSize === s 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 text-sm sm:text-base">Quantity:</label>
          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="px-3 sm:px-4 py-2 text-lg sm:text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-6 sm:px-8 py-2 text-sm sm:text-base font-bold text-center border-x border-gray-300 min-w-[80px]">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              className="px-3 sm:px-4 py-2 text-lg sm:text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20py-3 sm:py-4 rounded-xl hover:bg-purple-700 transition duration-200 text-sm sm:text-base font-bold flex items-center justify-center gap-2 mb-3"
        >
          <Handbag className="w-5 h-5 sm:w-6 sm:h-6" />
          Add to Cart
        </button>

        {/* Message Notification */}
        {addedMessage && (
          <div className={`text-center text-sm sm:text-base font-medium mt-4 p-3 rounded-lg ${
            addedMessage.includes("Please") 
              ? "text-red-600 bg-red-50" 
              : "text-green-600 bg-green-50"
          }`}>
            {addedMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Productdetail;