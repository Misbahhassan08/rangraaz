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
  Settings,
  HelpCircle
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
        className="lg:hidden fixed top-5 left-5 z-50 bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white p-2.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#8D33F6] to-[#E034F5] text-white p-6 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static`}
      >
        {/* Logo / Title */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl font-bold tracking-wide">
            Admin<span className="text-white/80">Panel</span>
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Management System
          </p>
          <div className="w-12 h-0.5 bg-white/20 mx-auto lg:mx-0 mt-3 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/dashboard"
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
            to="/dashboard/users"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-white/80 hover:text-white"}`
            }
          >
            <Users size={18} />
            <span>Users</span>
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
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-10 space-y-2">
          {/* Copyright */}
          <div className="pt-4 mt-4 border-t border-white/20">
            <p className="text-xs text-white/40 text-center">
              © 2026 Admin Panel
            </p>
            <p className="text-[10px] text-white/30 text-center mt-1">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;