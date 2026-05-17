import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  Menu,
  X,
  FileText,
  Barcode,
  ScanLine,
  Navigation,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 text-sm font-medium";

  const activeClass =
    "bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-[70] rounded-full bg-gradient-to-r from-[#8D33F6] to-[#E034F5] p-3 text-white shadow-xl shadow-purple-500/25 transition hover:scale-105 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-[60] flex h-dvh w-[82vw] max-w-72 flex-col overflow-y-auto bg-gradient-to-b from-[#8D33F6] to-[#E034F5] p-6 text-white shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0`}
      >
        {/* Logo / Title */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl font-bold tracking-wide">
            Admin<span className="text-white/80">Panel</span>
          </h2>
          <p className="text-xs text-white/60 mt-1">Management System</p>
          <div className="w-12 h-0.5 bg-white/20 mx-auto lg:mx-0 mt-3 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/dashboard"
            end
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/dashboard/products"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/dashboard/orders"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <ShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/dashboard/pages"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <FileText size={18} />
            <span>Pages</span>
          </NavLink>

          <NavLink
            to="/dashboard/header-builder"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Navigation size={18} />
            <span>Header Builder</span>
          </NavLink>

          <NavLink
            to="/dashboard/users"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Users size={18} />
            <span>Manage Users</span>
          </NavLink>

          <NavLink
            to="/dashboard/manage-slider"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Image size={18} />
            <span>Manage Slider</span>
          </NavLink>

          {/* Barcode Manager */}
          <NavLink
            to="/dashboard/barcode-manager"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Barcode size={18} />
            <span>Barcode Manager</span>
          </NavLink>

          {/* Manage Stock / POS */}
          <NavLink
            to="/dashboard/pos"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <ScanLine size={18} />
            <span>Manage Stock</span>
          </NavLink>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-10 space-y-2">
          <div className="pt-4 mt-4 border-t border-white/20">
            <p className="text-xs text-white/40 text-center">© 2026 Admin Panel</p>
            <p className="text-[10px] text-white/30 text-center mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
