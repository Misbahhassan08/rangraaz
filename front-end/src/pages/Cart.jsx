import React from 'react';
import Cartitem from '../components/Cartitem';
import { useNavigate } from "react-router-dom";
import productStore from '../store/Productstore';
import { ShoppingBag, ArrowLeft, CreditCard, Truck } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const cart = productStore((state) => state.cart);
  const getTotalPrice = productStore((state) => state.getTotalPrice);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/allproducts");
  };

  // Calculate total items
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate savings (if you have original price vs sale price logic)
  // This is just an example - adjust based on your data structure
  const calculateSavings = () => {
    // You can implement this based on your product data
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-purple-600" size={24} />
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cart.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 md:p-16 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <button
                onClick={handleContinueShopping}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            
            {/* Cart Items Section */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              {/* Cart Items Header - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 gap-4 bg-white p-4 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>

              {/* Cart Items */}
              {cart.map((product) => (
                <Cartitem
                  key={`${product.id}-${product.size}`}
                  id={product.id}
                  price={product.price}
                  title={product.title}
                  image_url={product.image_url}
                  product_type={product.product_type}
                  size={product.size}
                  quantity={product.quantity}
                />
              ))}

              {/* Continue Shopping Link */}
              <button
                onClick={handleContinueShopping}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 mt-4"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>

            {/* Order Summary Section */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="bg-white border-2 border-gray-100 shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 sticky top-24">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Order Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">Rs. {getTotalPrice()}</span>
                  </div>
                  
                  {/* <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div> */}

                  {calculateSavings() > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">You Save</span>
                      <span className="text-red-500 font-medium">-Rs. {calculateSavings()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-4">
                  <span className="text-sm sm:text-base font-bold text-gray-800">Total</span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-purple-600">Rs. {getTotalPrice()}</span>
                    <p className="text-[10px] sm:text-xs text-gray-500">Inclusive of all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20py-3 sm:py-4 rounded-xl hover:bg-purple-700 transition duration-200 text-sm sm:text-base font-bold flex items-center justify-center gap-2 mb-3"
                >
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;