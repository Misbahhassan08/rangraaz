import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import productStore from "../store/Productstore";
import { HeartPlus, ChevronLeft, ChevronRight } from "lucide-react";
import URLS from "../urls";
import axios from "axios";

const Allproducts = () => {
  const [productsData, setProductsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridCols, setGridCols] = useState(4); // Default grid layout
const [productsPerPage, setProductsPerPage] = useState(0);
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const subCategoryParam = searchParams.get("subcategory");
  const saleParam = searchParams.get("sale");
  const searchParam = searchParams.get("search");

  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);
useEffect(() => {
  if (productsData.length > 0) {
    setProductsPerPage(productsData.length);
  }
}, [productsData]);
  // 1. Fetch Products logic
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(URLS.fetchProducts);
        setProductsData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, subCategoryParam, saleParam, searchParam, productsPerPage]);

  // 2. Filter Logic - UPDATED to handle multiple filters simultaneously
  const filteredProducts = productsData.filter((product) => {
    // Start with all conditions being true
    let matchesSearch = true;
    let matchesSale = true;
    let matchesCategory = true;
    let matchesSubCategory = true;
    
    // Apply search filter if present
    if (searchParam) {
      matchesSearch = product.product_name.toLowerCase().includes(searchParam.toLowerCase());
    }
    
    // Apply sale filter if present
    if (saleParam === "true") {
      matchesSale = product.is_sale_on === true;
    }
    
    // Apply category filter if present
    if (categoryParam) {
      matchesCategory = product.category?.toLowerCase() === categoryParam.toLowerCase();
    }
    
    // Apply subcategory filter if present
    if (subCategoryParam) {
      matchesSubCategory = product.sub_category?.toLowerCase() === subCategoryParam.toLowerCase();
    }
    
    // Return true only if ALL active filters match
    return matchesSearch && matchesSale && matchesCategory && matchesSubCategory;
  });

  // 3. Pagination Logic
  const itemsPerPage = parseInt(productsPerPage) || 12; 
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Grid Columns Mapping (2, 3, 4, 6 bars)
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-3 md:grid-cols-6",
  }[gridCols] || "grid-cols-4";

  // 5. Bars Icon Renderer
  const renderIcon = (bars) => {
    return (
      <div className="flex gap-[2px] h-4 items-center px-0.5">
        {[...Array(bars)].map((_, i) => (
          <div key={i} className="w-[3px] h-full bg-current"></div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-8 font-sans antialiased">
      <h1 className="text-center text-2xl font-bold tracking-widest mb-10 uppercase text-gray-800">
        {categoryParam || "All Products"}
      </h1>

      {/* TOOLBAR: Grid controls and Show Amount */}
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-gray-100 pb-5 gap-4">
  
  {/* Left: Items count */}
  <p className="text-sm text-gray-400 font-medium">
    {filteredProducts.length} items found
  </p>

  {/* Center: Grid + Show Amount */}
  <div className="flex items-center gap-6">
    
    {/* Grid Toggle - better UI */}
    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
      {[2, 3, 4, 6].map((num) => (
        <button
          key={num}
          onClick={() => setGridCols(num)}
            style={{ cursor: 'pointer' }}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200  cursor-pointer${
            gridCols === num
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {renderIcon(num)}
        </button>
      ))}
    </div>

    {/* Show Amount - same as before */}
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-bold uppercase text-blue-500 mb-0.5 tracking-tighter">Show Amount</span>
      <input
        type="number"
        min="1"
        value={productsPerPage}
        onChange={(e) => setProductsPerPage(e.target.value)}
        className="w-20 h-9 border-2 border-blue-100 rounded-lg text-center text-sm font-bold focus:border-blue-500 outline-none transition-all"
      />
    </div>

  </div>
</div>

      {/* PRODUCT GRID */}
      <div className={`grid ${gridClass} gap-x-4 gap-y-12 transition-all duration-500 ease-in-out`}>
        {currentProducts.map((product) => (
          <div key={product.id} className="relative group">
            <button
              onClick={() => toggleFavorite(product)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <HeartPlus
                className={`${favorites.some((f) => f.id === product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                size={18}
              />
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

      {/* PAGINATION SECTION: Pages, Next, Prev */}
      {totalPages > 1 && (
        <div className="mt-20 flex flex-col items-center gap-4 border-t border-gray-100 pt-10">
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 p-2 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={18} /> <span className="text-sm font-medium">Prev</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-md text-sm font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 p-2 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
            >
              <span className="text-sm font-medium">Next</span> <ChevronRight size={18} />
            </button>
          </div>
          
          <p className="text-xs text-gray-400 italic">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
        </div>
      )}
    </div>
  );
};

export default Allproducts;