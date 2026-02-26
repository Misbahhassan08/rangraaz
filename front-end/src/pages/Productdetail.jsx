import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import productStore from "../store/Productstore";
import { HeartPlus, Handbag, ChevronLeft } from "lucide-react";

const Productdetail = () => {
  const quantity = productStore((state) => state.quantity);
  const increaseQuantity = productStore((state) => state.increaseQuantity);
  const decreaseQuantity = productStore((state) => state.decreaseQuantity);
  const addToCart = productStore((state) => state.addToCart);
  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);

  const [addedMessage, setAddedMessage] = React.useState("");
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { id, price, title, product_type, image_url, size, originalPrice, isSaleOn, sellPrice, brand } = location.state || {};

  const availableSizes = size ? size.split(",").map(s => s.trim()) : [];
  const displayPrice = isSaleOn ? sellPrice : price || originalPrice;

  const handleAddToCart = () => {
    if (!selectedSize && availableSizes.length > 0) {
      setAddedMessage("Please select a size.");
      setTimeout(() => setAddedMessage(""), 2000);
      return;
    }
    
    const productToAdd = {
      id,
      title,
      price: displayPrice,
      originalPrice: originalPrice,
      isSaleOn,
      image_url,
      product_type,
      size: selectedSize || (availableSizes[0] || "One Size"),
      quantity,
      brand
    };

    addToCart(productToAdd);
    setAddedMessage("Added to cart!");

    setTimeout(() => {
      setAddedMessage("");
      // Optional: navigate to cart or keep on product page
      // navigate("/cart");
    }, 1500);
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id,
      title,
      price: displayPrice,
      originalPrice,
      isSaleOn,
      image_url,
      product_type,
      size: availableSizes,
      brand
    });
  };

  const isFavorited = favorites.some((item) => item.id === id);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8D33F6] transition-colors mb-4 sm:mb-6"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 sm:p-6 md:p-8">
            
            {/* Product Image Section */}
            <div className="lg:w-1/2">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-[#8D33F6] rounded-full animate-spin"></div>
                  </div>
                )}
                <InnerImageZoom
                  src={image_url || "/img/placeholder.jpg"}
                  zoomSrc={image_url}
                  zoomType="hover"
                  zoomPreload={true}
                  zoomScale={2}
                  alt={title}
                  className="w-full aspect-square object-cover"
                  onLoad={() => setIsImageLoading(false)}
                />
                
                {/* Sale Badge */}
                {isSaleOn && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                    SALE
                  </span>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="lg:w-1/2 space-y-5 sm:space-y-6">
              {/* Header with Title and Wishlist */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  {brand && (
                    <p className="text-[#8D33F6] text-xs font-bold uppercase tracking-wider mb-2">
                      {brand}
                    </p>
                  )}
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{product_type}</p>
                </div>
                
                {/* Wishlist Button - Fixed styling */}
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    isFavorited 
                      ? "bg-red-50 text-red-500" 
                      : "bg-gray-100 text-gray-400 hover:text-red-400 hover:bg-gray-200"
                  }`}
                  aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartPlus 
                    size={22} 
                    className={isFavorited ? "fill-red-500" : ""}
                  />
                </button>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#8D33F6]">
                  Rs. {displayPrice}
                </span>
                {isSaleOn && originalPrice && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    Rs. {originalPrice}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Select Size
                    {selectedSize && (
                      <span className="text-xs font-normal text-green-600">
                        (Selected: {selectedSize})
                      </span>
                    )}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`
                          min-w-[44px] h-11 px-3 flex items-center justify-center 
                          text-sm font-medium border-2 rounded-lg
                          transition-all duration-200
                          ${selectedSize === s 
                            ? 'bg-[#8D33F6] text-white border-[#8D33F6] shadow-md' 
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#8D33F6] hover:text-[#8D33F6]'
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
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Quantity</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <span className="px-6 py-2.5 text-sm font-bold text-center border-x-2 border-gray-200 min-w-[60px]">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {quantity} {quantity === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Handbag className="w-5 h-5" />
                Add to Cart
              </button>

              {/* Success/Error Message */}
              {addedMessage && (
                <div className={`text-center text-sm font-medium p-3 rounded-lg ${
                  addedMessage.includes("select") 
                    ? "bg-red-50 text-red-600" 
                    : "bg-green-50 text-green-600"
                }`}>
                  {addedMessage}
                </div>
              )}

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>✓ Free Shipping</span>
                  <span>✓ Easy Returns</span>
                  <span>✓ Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section - Optional */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Add related products here if available */}
            <div className="bg-white p-4 rounded-lg text-center text-gray-400 text-sm">
              More products coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productdetail;