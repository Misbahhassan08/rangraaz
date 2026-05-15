import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-8 border-t border-[var(--border-soft)] bg-[var(--surface-main)] py-8 text-[var(--text-main)] sm:mt-12 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/img/logo.png" alt="Rang Raaz" className="h-16 w-auto" />
          <p className="text-xs font-light uppercase tracking-[0.26em] text-[var(--text-muted)]">Embrace colors Made for you!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">

          {/* Company Section */}
          <div>
            <h2 className="font-display text-xl font-medium mb-3 sm:mb-4">Company</h2>
            <p className="text-xs font-light leading-relaxed text-[var(--text-muted)]">
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
            <h2 className="font-display text-xl font-medium mb-3 sm:mb-4">Shop</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/allproducts?category=ALLY'S"
                  className="text-xs font-light tracking-wider text-[var(--text-muted)] hover:text-[var(--brand-pink)]"
                >
                  ALLY'S
                </Link>
              </li>
              <li>
                <Link
                  to="/allproducts?category=HEERA'S"
                  className="text-xs font-light tracking-wider text-[var(--text-muted)] hover:text-[var(--brand-pink)]"
                >
                  HEERA'S
                </Link>
              </li>
              <li>
                <Link
                  to="/allproducts?category=Rangraaz"
                  className="text-xs font-light tracking-wider text-[var(--text-muted)] hover:text-[var(--brand-pink)]"
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
            <h2 className="font-display text-xl font-medium mb-3 sm:mb-4">Follow Us</h2>
            <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">

              {/* WhatsApp */}
              <a href="https://wa.me/16093858422" target="_blank" rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300">
                <img src="/img/social.png" alt="WhatsApp"
                  className="w-5 h-5 object-contain hover:opacity-80 transition-opacity" />
              </a>

              {/* Instagram */}
              <a href="https://wa.me/16093858422" target="_blank" rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300">
                <img src="/img/video.png" alt="Instagram"
                  className="w-5 h-5 object-contain hover:opacity-80 transition-opacity" />
              </a>

              {/* TikTok */}
              <a href="https://www.tiktok.com/@rangraaz.online?_t=ZP-8yH1p85FZd8&_r=1" target="_blank" rel="noopener noreferrer"
                className="transform hover:scale-110 transition-transform duration-300">
                <img src="/img/tiktok.png" alt="TikTok"
                  className="w-5 h-5 object-contain hover:opacity-80 transition-opacity" />
              </a>
            </div>

            {/* Additional Links */}
            <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
              <Link
                to="/favorites"
                className="mb-2 block text-xs font-light tracking-wider text-[var(--text-muted)] hover:text-[var(--brand-pink)]"
              >
                My Favorites
              </Link>
              <Link
                to="/cart"
                className="block text-xs font-light tracking-wider text-[var(--text-muted)] hover:text-[var(--brand-pink)]"
              >
                Shopping Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 border-t border-[var(--border-soft)] pt-4 text-center text-xs text-[var(--text-soft)] sm:mt-8 sm:pt-6 sm:text-sm">
          &copy; {new Date().getFullYear()} Rang Raaz. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
