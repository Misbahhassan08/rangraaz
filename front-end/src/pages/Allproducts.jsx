import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductItem from "../components/Productitem";
import productStore from "../store/Productstore";
import { HeartPlus, ChevronLeft, ChevronRight } from "lucide-react";
import URLS from "../urls";
import axios from "axios";

const Allproducts = () => {
  const [productsData, setProductsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridCols, setGridCols] = useState(4); 
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
    <div className="mx-auto max-w-[1440px] px-4 py-10 font-sans antialiased md:px-8">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-light uppercase tracking-[0.28em] text-[var(--brand-pink)]">Collection</p>
        <h1 className="font-display text-4xl font-medium text-[var(--text-main)] md:text-5xl">
        {categoryParam || "All Products"}
        </h1>
      </div>

      {/* TOOLBAR: Grid controls and Show Amount */}
      <div className="brand-glass mb-10 flex flex-col items-center justify-between gap-4 rounded-3xl px-5 py-4 md:flex-row">

        {/* Left: Items count */}
        <p className="text-sm font-light text-[var(--text-muted)]">
          {filteredProducts.length} items found
        </p>

        {/* Center: Grid + Show Amount */}
        <div className="flex items-center gap-6">

          {/* Grid Toggle - better UI */}
          <div className="flex items-center gap-0.5 rounded-2xl bg-[var(--surface-soft)] p-1">
            {[2, 3, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setGridCols(num)}
                style={{ cursor: 'pointer' }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200  cursor-pointer${gridCols === num
                    ? "bg-[var(--surface-main)] text-[var(--text-main)] shadow-sm"
                    : "text-[var(--text-soft)] hover:text-[var(--text-main)]"
                  }`}
              >
                {renderIcon(num)}
              </button>
            ))}
          </div>

          {/* Show Amount - same as before */}
          <div className="flex flex-col items-start">
            <span className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--brand-pink)]">Show Amount</span>
            <input
              type="number"
              min="1"
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(e.target.value)}
              className="h-9 w-20 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-main)] text-center text-sm font-medium text-[var(--text-main)] outline-none transition-all focus:border-[var(--brand-pink)]"
            />
          </div>

        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className={`grid ${gridClass} gap-x-5 gap-y-12 transition-all duration-500 ease-in-out`}>
        {currentProducts.map((product) => (
          <div key={product.id} className="relative group">
            <button
              onClick={() => toggleFavorite(product)}
              className="absolute right-4 top-4 z-10 rounded-full bg-[var(--surface-card)] p-2 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100"
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
              size_stocks={product.size_stocks}
            />
          </div>
        ))}
      </div>

      {/* PAGINATION SECTION: Pages, Next, Prev */}
      {totalPages > 1 && (
        <div className="mt-20 flex flex-col items-center gap-4 border-t border-[var(--border-soft)] pt-10">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 p-2 text-[var(--text-soft)] transition-all hover:text-[var(--text-main)] disabled:opacity-20"
            >
              <ChevronLeft size={18} /> <span className="text-sm font-medium">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-md text-sm font-bold transition-all ${currentPage === page
                      ? 'bg-[var(--brand-purple)] text-white shadow-md'
                      : 'text-[var(--text-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 p-2 text-[var(--text-soft)] transition-all hover:text-[var(--text-main)] disabled:opacity-20"
            >
              <span className="text-sm font-medium">Next</span> <ChevronRight size={18} />
            </button>
          </div>

          <p className="text-xs text-[var(--text-soft)] italic">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
        </div>
      )}
    </div>
  );
};

export default Allproducts;
