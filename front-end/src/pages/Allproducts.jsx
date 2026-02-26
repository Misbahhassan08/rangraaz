import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import productStore from "../store/Productstore";
import { HeartPlus, ChevronLeft, ChevronRight, LayoutGrid, Filter, X } from "lucide-react";
import URLS from "../urls";
import axios from "axios";

const Allproducts = () => {
  const navigate = useNavigate();
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridCols, setGridCols] = useState(4);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("subcategory");
  const saleParam = searchParams.get("sale");
  const searchParam = searchParams.get("search");
  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);

  
  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(URLS.fetchProducts);
        setProductsData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, subCategoryParam, saleParam, searchParam, productsPerPage]);

  // Filter Logic
  const filteredProducts = productsData.filter((product) => {
    if (searchParam) {
      return product.product_name?.toLowerCase().includes(searchParam.toLowerCase());
    }
    if (saleParam === "true") {
      return product.is_sale_on === true;
    }
    const matchesCategory = categoryParam 
      ? product.category?.toLowerCase() === categoryParam.toLowerCase() 
      : true;
    const matchesSubCategory = subCategoryParam 
      ? product.sub_category?.toLowerCase() === subCategoryParam.toLowerCase() 
      : true;
    return matchesCategory && matchesSubCategory;
  });

  // Pagination Logic
  const itemsPerPage = parseInt(productsPerPage) || 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Grid Columns Mapping (Responsive)
  const getGridClass = () => {
    switch(gridCols) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 md:grid-cols-3";
      case 4: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 6: return "grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      default: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  // Bars Icon Renderer
  const renderIcon = (bars) => {
    return (
      <div className="flex gap-[2px] h-4 items-center px-0.5">
        {[...Array(bars)].map((_, i) => (
          <div 
            key={i} 
            className="w-[3px] h-full bg-current transition-all"
            style={{ 
              height: `${Math.max(4, (i + 1) * 3)}px`,
              opacity: 0.8 
            }}
          ></div>
        ))}
      </div>
    );
  };

  // Get page title
  const getPageTitle = () => {
    if (searchParam) return `Search: "${searchParam}"`;
    if (subCategoryParam) return `${categoryParam} - ${subCategoryParam}`;
    if (categoryParam) return `${categoryParam}'s Collection`;
    if (saleParam) return "Flash Sale";
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-wider uppercase">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filter & Sort</span>
            </button>
          </div>

          {/* Active Filters */}
          {(categoryParam || subCategoryParam || saleParam || searchParam) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {categoryParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Category: {categoryParam}
                  <button 
                    onClick={() => navigate('/allproducts')} 
                    className="hover:text-purple-900 ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {subCategoryParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Subcategory: {subCategoryParam}
                  <button 
                    onClick={() => navigate(`/allproducts?category=${categoryParam}`)} 
                    className="hover:text-blue-900 ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {saleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  Sale Items
                  <button 
                    onClick={() => navigate('/allproducts')} 
                    className="hover:text-red-900 ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  "{searchParam}"
                  <button 
                    onClick={() => navigate('/allproducts')} 
                    className="hover:text-green-900 ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* TOOLBAR: Grid controls and Show Amount */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* Grid Layout Selection */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {[2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setGridCols(num)}
                  className={`px-3 sm:px-4 py-2 transition-all border-r last:border-r-0 ${
                    gridCols === num
                      ? "bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white"
                      : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                  title={`${num} columns`}
                >
                  {renderIcon(num)}
                </button>
              ))}
            </div>

            {/* Show Amount Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 hidden sm:block">Show:</span>
              <select
                value={productsPerPage}
                onChange={(e) => setProductsPerPage(e.target.value)}
                className="w-16 sm:w-20 h-9 border-2 border-gray-200 rounded-lg text-center text-sm font-medium focus:border-[#8D33F6] outline-none transition-all bg-white"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>

          {/* Results info - Hidden on mobile */}
          <p className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-[#8D33F6] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            {/* PRODUCT GRID */}
            {filteredProducts.length > 0 ? (
              <div className={`grid ${getGridClass()} gap-3 sm:gap-4 md:gap-6 transition-all duration-300`}>
                {currentProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    {/* Wishlist Button - Always visible on mobile, on hover on desktop */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full shadow-md transition-all duration-300 ${
                        favorites.some((f) => f.id === product.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-[#8D33F6] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      }`}
                      aria-label={favorites.some(f => f.id === product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <HeartPlus 
                        size={16} 
                        className={favorites.some((f) => f.id === product.id) ? "fill-white" : ""}
                      />
                    </button>

                    <ProductItem
                      id={product.id}
                      title={product.product_name}
                      originalPrice={product.original_price}
                      sellPrice={product.sell_price}
                      isSaleOn={product.is_sale_on}
                      image_url={product.image_url}
                      product_type={product.product_type}
                      size={product.size}
                      brand={product.brand}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16 sm:py-20 bg-white rounded-lg shadow-sm">
                <div className="max-w-md mx-auto px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartPlus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No products found</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-6">
                    {searchParam 
                      ? `No results found for "${searchParam}"` 
                      : "Try adjusting your filters or browse all products"}
                  </p>
                  <button
                    onClick={() => navigate('/allproducts')}
                    className="px-6 py-2 bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 sm:mt-16 flex flex-col items-center gap-4">
                {/* Mobile Pagination (Simplified) */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 text-gray-400 disabled:opacity-20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 text-gray-400 disabled:opacity-20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-[#8D33F6] disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft size={18} />
                    <span className="text-sm font-medium">Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-md text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-md'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-gray-300">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-9 h-9 rounded-md text-sm font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-[#8D33F6] disabled:opacity-20 transition-all"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-400 sm:hidden">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filter Panel */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Filters</h3>
              <button 
                onClick={() => setMobileFilterOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {/* Add filter options here */}
              <p className="text-gray-500 text-sm">Filter options coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allproducts;