import React, { useState, useRef, useEffect } from "react";
import { Handbag, HeartPlus, User, Search, LayoutDashboard, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import productStore from "../store/Productstore";
import URLS from "../urls";

const Header = () => {
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("Loading deals...");
  const [isScrolling, setIsScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const inputRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const cart = productStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const favorites = productStore((state) => state.favorites);

  useEffect(() => {
    fetch(URLS.announcement)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncement(data.text);
        setIsScrolling(data.is_scrolling);
      })
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  const handleSearchClick = () => setShowInput(true);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/allproducts?search=${query}`);
      setShowInput(false);
    }
  };

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const categories = [
    { name: "ALLY'S", id: "ALLY'S", image: "/img/dress.jpg" },
    { name: "HEERA'S", id: "HEERA'S", image: "/img/dress.jpg" },
    { name: "RANGRAAZ", id: "Rangraaz", image: "/img/dress.jpg" }
  ];

  return (
    <div className="w-full">
      {/* --- 1. Announcement Bar --- */}
      <div className="bg-purple-300 py-2 px-4 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-bold overflow-hidden relative h-8 sm:h-10 flex items-center shadow-sm">
        <div className={`whitespace-nowrap ${isScrolling ? "absolute animate-marquee-inline" : "w-full text-center"}`}>
          <span>{announcement}</span>
          {isScrolling && <span className="ml-[50px] sm:ml-[100px]">{announcement}</span>}
        </div>
      </div>

      {/* --- 2. Main Navigation Bar --- */}
      <div className="flex justify-between items-center py-3 px-4 sm:px-6 md:px-10 bg-white shadow-sm sticky top-0 z-50">
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo - Centered on mobile, left on desktop */}
        <div className={`cursor-pointer transition-transform hover:scale-105 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'} lg:opacity-100`}>
          <Link to="/">
            <img src="/img/logo.png" alt="logo" className="h-8 sm:h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation Menu - Hidden on mobile */}
        <nav className="hidden lg:block flex-1 mx-8">
          <ul className="flex justify-center space-x-6 xl:space-x-10 text-[10px] xl:text-[11px] tracking-[0.2em] font-bold items-center text-gray-800">
            {categories.map((cat) => (
              <li key={cat.id} className="relative group py-2">
                <Link
                  to={`/allproducts?category=${cat.id}`}
                  className="cursor-pointer hover:text-purple-600 transition-all duration-300 flex items-center gap-1 whitespace-nowrap"
                >
                  {cat.name}
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 hidden group-hover:flex bg-white shadow-2xl rounded-2xl z-50 w-[350px] xl:w-[400px] overflow-hidden border border-gray-100 mt-2">
                  <div className="w-2/5 overflow-hidden">
                    <img src={cat.image} alt="collection" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <div className="w-3/5 p-4 xl:p-6 bg-white">
                    <p className="text-[8px] xl:text-[9px] text-purple-400 mb-3 xl:mb-4 tracking-[0.2em] uppercase border-b border-gray-50 pb-2">
                      {cat.name} Essentials
                    </p>
                    <ul className="space-y-2 xl:space-y-3">
                      {cat.id === "Rangraaz" ? (
                        <>
                          <li><Link to={`/allproducts?category=${cat.id}&subcategory=2 Piece`} className="text-gray-600 hover:text-purple-600 hover:pl-2 transition-all block text-[11px] xl:text-[13px] font-medium italic">2 Piece</Link></li>
                          <li><Link to={`/allproducts?category=${cat.id}&subcategory=3 Piece`} className="text-gray-600 hover:text-purple-600 hover:pl-2 transition-all block text-[11px] xl:text-[13px] font-medium italic">3 Piece</Link></li>
                          <li><Link to={`/allproducts?category=${cat.id}&subcategory=Maxi`} className="text-gray-600 hover:text-purple-600 hover:pl-2 transition-all block text-[11px] xl:text-[13px] font-medium italic">Maxi</Link></li>
                        </>
                      ) : (
                        <>
                          <li><Link to={`/allproducts?category=${cat.id}&subcategory=Fancy`} className="text-gray-600 hover:text-purple-600 hover:pl-2 transition-all block text-[11px] xl:text-[13px] font-medium italic uppercase">Fancy</Link></li>
                          <li><Link to={`/allproducts?category=${cat.id}&subcategory=Casual`} className="text-gray-600 hover:text-purple-600 hover:pl-2 transition-all block text-[11px] xl:text-[13px] font-medium italic uppercase">Casual</Link></li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </li>
            ))}

            <li>
              <Link to="/allproducts?sale=true" className="text-red-600 hover:text-red-700 transition-colors whitespace-nowrap">
                SALE
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Side Icons */}
        <div className="flex gap-3 sm:gap-4 md:gap-6 items-center relative">
          <LayoutDashboard 
            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer text-gray-500 hover:text-purple-600 transition-colors" 
            strokeWidth={1.5} 
            onClick={() => navigate("/dashboard")} 
          />

          <div className="flex items-center">
            <Search 
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer text-gray-500 hover:text-black transition-colors" 
              strokeWidth={1.5} 
              onClick={handleSearchClick} 
            />
            {showInput && (
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onBlur={() => setTimeout(() => setShowInput(false), 200)}
                placeholder="Search..."
                className="absolute right-full mr-2 transition-all duration-300 border-b border-gray-300 px-2 py-1 w-32 sm:w-40 text-[10px] sm:text-[12px] focus:outline-none focus:border-purple-600"
              />
            )}
          </div>

          <div className="relative group">
            <HeartPlus 
              className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer ${favorites.length > 0 ? "text-red-500" : "text-gray-500 hover:text-red-400"}`} 
              strokeWidth={1.5} 
              onClick={() => navigate("/favorites")} 
            />
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-md">
                {favorites.length}
              </span>
            )}
          </div>

          <User 
            onClick={() => navigate("/login")} 
            className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-black transition-colors" 
            strokeWidth={1.5} 
          />

          <Link to="/cart" className="relative group">
            <Handbag 
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-purple-600 transition-colors" 
              strokeWidth={1.5} 
            />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div 
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <img src="/img/logo.png" alt="logo" className="h-8 w-auto" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.id} className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === cat.id ? null : cat.id)}
                  className="w-full flex justify-between items-center text-left font-bold text-gray-800 hover:text-purple-600 transition-colors"
                >
                  <span>{cat.name}</span>
                  <span className="text-xl">{activeDropdown === cat.id ? '−' : '+'}</span>
                </button>
                
                {activeDropdown === cat.id && (
                  <div className="mt-3 pl-4 space-y-2">
                    {cat.id === "Rangraaz" ? (
                      <>
                        <Link to={`/allproducts?category=${cat.id}&subcategory=2 Piece`} className="block text-sm text-gray-600 hover:text-purple-600 py-1">2 Piece</Link>
                        <Link to={`/allproducts?category=${cat.id}&subcategory=3 Piece`} className="block text-sm text-gray-600 hover:text-purple-600 py-1">3 Piece</Link>
                        <Link to={`/allproducts?category=${cat.id}&subcategory=Maxi`} className="block text-sm text-gray-600 hover:text-purple-600 py-1">Maxi</Link>
                      </>
                    ) : (
                      <>
                        <Link to={`/allproducts?category=${cat.id}&subcategory=Fancy`} className="block text-sm text-gray-600 hover:text-purple-600 py-1">Fancy</Link>
                        <Link to={`/allproducts?category=${cat.id}&subcategory=Casual`} className="block text-sm text-gray-600 hover:text-purple-600 py-1">Casual</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <Link 
              to="/allproducts?sale=true" 
              className="block text-red-600 font-bold hover:text-red-700 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              SALE
            </Link>
          </div>

          {/* Mobile Menu Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Your Store. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;