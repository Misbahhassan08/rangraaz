import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-8 sm:mt-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">
          
          {/* Company Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">COMPANY</h2>
            <p className="text-[10px] sm:text-xs tracking-wider sm:tracking-widest leading-relaxed opacity-90">
              Business Addon
              <br />
              Rang Raaz
              <br />
              124 Buchanan Ave
              <br />
              GALLOWAY, NJ 08205
            </p>
          </div>

          {/* Shop Categories - From Header Menu */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">SHOP</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/allproducts?category=ALLY'S" 
                  className="text-[10px] sm:text-xs tracking-wider hover:text-purple-400 transition-colors"
                >
                  ALLY'S
                </Link>
              </li>
              <li>
                <Link 
                  to="/allproducts?category=HEERA'S" 
                  className="text-[10px] sm:text-xs tracking-wider hover:text-purple-400 transition-colors"
                >
                  HEERA'S
                </Link>
              </li>
              <li>
                <Link 
                  to="/allproducts?category=Rangraaz" 
                  className="text-[10px] sm:text-xs tracking-wider hover:text-purple-400 transition-colors"
                >
                  RANGRAAZ
                </Link>
              </li>
              <li>
                <Link 
                  to="/allproducts?sale=true" 
                  className="text-[10px] sm:text-xs tracking-wider text-red-400 hover:text-red-300 transition-colors"
                >
                  SALE
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">FOLLOW US</h2>
            <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">
              
              {/* WhatsApp */}
              <a
                href="https://wa.me/16093858422"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300"
              >
                <img
                  src="/img/whatsapp.png"
                  alt="WhatsApp"
                  className="w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity"
                />
              </a>
              
              {/* Instagram */}
              <a
                href="https://wa.me/16093858422"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300"
              >
                <img
                  src="/img/instagram.webp"
                  alt="Instagram"
                  className="w-7 h-7 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
                />
              </a>
              
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@rangraaz.online?_t=ZP-8yH1p85FZd8&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300"
              >
                <img
                  src="/img/tiktok.webp"
                  alt="TikTok"
                  className="w-7 h-7 sm:w-10 sm:h-10 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>

            {/* Additional Links */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link 
                to="/favorites" 
                className="text-[10px] sm:text-xs tracking-wider text-gray-400 hover:text-purple-400 transition-colors block mb-2"
              >
                My Favorites
              </Link>
              <Link 
                to="/cart" 
                className="text-[10px] sm:text-xs tracking-wider text-gray-400 hover:text-purple-400 transition-colors block"
              >
                Shopping Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 text-center border-t border-gray-800 pt-4 sm:pt-6">
          &copy; {new Date().getFullYear()} Rang Raaz. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;