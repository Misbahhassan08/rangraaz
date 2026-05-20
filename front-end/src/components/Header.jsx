import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import productStore from "../store/Productstore";
import URLS from "../urls";

const fallbackHoverImages = {
  allys: "/img/image1.webp",
  heeras: "/img/image2.webp",
  rangraaz: "/img/image3.webp",
  sale: "/img/logo2.png",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [announcement, setAnnouncement] = useState("Embrace colors Made for you!");
  const [isScrolling, setIsScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [headerGroups, setHeaderGroups] = useState([]);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const cart = productStore((state) => state.cart);
  const favorites = productStore((state) => state.favorites);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser && storedUser !== "undefined" && storedUser !== "null"
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  })();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch(URLS.announcement)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncement(data.text || "Embrace colors Made for you!");
        setIsScrolling(Boolean(data.is_scrolling));
      })
      .catch((err) => console.error("Error fetching announcement:", err));
  }, []);

  useEffect(() => {
    fetch(URLS.headerNav)
      .then((res) => res.json())
      .then((data) => setHeaderGroups(data.data || []))
      .catch((err) => console.error("Error fetching header navigation:", err));
  }, []);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = () => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    navigate(`/allproducts?search=${encodeURIComponent(cleanQuery)}`);
    setShowSearch(false);
  };

  const handleUserClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (window.confirm("Do you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
      window.location.reload();
    }
  };

  const iconButton =
    "relative grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-glass)] text-[var(--text-muted)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)] hover:shadow-lg";

  const groupLinkClass = (group, mobile = false) => {
    if (mobile) {
      return group.button_style === "sale"
        ? "block rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
        : "block px-4 py-3 text-sm font-medium text-[var(--text-main)]";
    }
    if (group.button_style === "sale") {
      return "rounded-full bg-red-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600";
    }
    if (group.button_style === "featured") {
      return "rounded-full bg-[var(--brand-purple)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-[var(--brand-pink)]";
    }
    return "rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-main)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand-pink)]";
  };

  const groupHref = (group) => group.direct_url || (group.pages?.[0] ? `/page/${group.pages[0].slug}` : "/allproducts");

  const renderNavigation = (mobile = false) => (
    <div className={mobile ? "space-y-3" : "flex items-center gap-1"}>
      {headerGroups.map((group) => {
        const children = group.show_dropdown ? group.pages || [] : [];
        const dropdownKey = `group-${group.id}`;
        const hoverImage = group.hover_image_url || fallbackHoverImages[group.slug];
        return (
          <div key={group.id} className={mobile ? "rounded-2xl border border-[var(--border-soft)]" : "group relative py-4"}>
            {mobile ? (
              children.length > 0 ? (
                <button
                  onClick={() => setActiveDropdown(activeDropdown === dropdownKey ? null : dropdownKey)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-main)]"
                >
                  <span>{group.title}</span>
                  <span className="text-lg text-[var(--brand-pink)]">{activeDropdown === dropdownKey ? "-" : "+"}</span>
                </button>
              ) : (
                <Link to={groupHref(group)} className={groupLinkClass(group, true)}>{group.title}</Link>
              )
            ) : (
              <Link
                to={groupHref(group)}
                className={groupLinkClass(group)}
              >
                {group.title}
              </Link>
            )}

            {(children.length > 0 || (!mobile && hoverImage && group.show_dropdown)) && (
              <div
                className={
                  mobile
                    ? `${activeDropdown === dropdownKey ? "block" : "hidden"} px-3 pb-3`
                    : "invisible absolute left-1/2 top-full z-50 w-[380px] -translate-x-1/2 translate-y-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                }
              >
                <div className={mobile ? "space-y-2" : "brand-menu overflow-hidden rounded-3xl"}>
                  {!mobile && hoverImage && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={hoverImage} alt={group.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="font-display text-2xl font-medium text-white">{group.hover_title || group.title}</p>
                        {group.hover_subtitle && <p className="mt-1 line-clamp-2 text-xs text-white/75">{group.hover_subtitle}</p>}
                      </div>
                    </div>
                  )}
                  <div className={mobile ? "space-y-2" : "grid grid-cols-2 gap-2 p-4"}>
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/page/${child.slug}`}
                        className="block rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--brand-purple)] hover:text-white"
                      >
                        {child.nav_label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="relative flex h-9 items-center overflow-hidden bg-[linear-gradient(100deg,#2b0752,#8122e0,#f02ccb)] px-4 text-[10px] font-light uppercase tracking-[0.22em] text-white">
        <div className={isScrolling ? "absolute animate-marquee-inline whitespace-nowrap" : "w-full text-center"}>
          <span>{announcement}</span>
          {isScrolling && <span className="ml-24">{announcement}</span>}
        </div>
      </div>

      <div className="brand-nav border-b border-[var(--border-soft)] px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <button className={iconButton + " lg:hidden"} onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={19} />
          </button>

          <Link to="/" className="group flex min-w-fit items-center gap-3">
            <img src="/img/logo.png" alt="Rang Raaz" className="h-11 w-auto transition duration-300 group-hover:scale-[1.02] md:h-14" />
            <span className="hidden border-l border-[var(--border-soft)] pl-3 text-[10px] font-light uppercase leading-4 tracking-[0.22em] text-[var(--text-muted)] xl:block">
              Embrace colors<br />Made for you!
            </span>
          </Link>

          <nav className="hidden flex-1 justify-center lg:flex">{renderNavigation()}</nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search colors, styles..."
                className={`h-10 rounded-full border border-[var(--border-soft)] bg-[var(--surface-glass)] px-4 pr-10 text-sm font-light text-[var(--text-main)] outline-none transition-all placeholder:text-[var(--text-soft)] focus:w-64 focus:border-[var(--brand-pink)] ${showSearch ? "w-64" : "w-11 cursor-pointer"}`}
                onFocus={() => setShowSearch(true)}
              />
              <Search
                size={17}
                onClick={() => (showSearch ? submitSearch() : setShowSearch(true))}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-muted)]"
              />
            </div>

            <button
              className={iconButton}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAdmin && (
              <button className={iconButton} onClick={() => navigate("/dashboard")} aria-label="Dashboard">
                <LayoutDashboard size={18} />
              </button>
            )}

            <button className={iconButton} onClick={() => navigate("/favorites")} aria-label="Favorites">
              <Heart size={18} className={favorites.length > 0 ? "fill-red-500 text-red-500" : ""} />
              {favorites.length > 0 && <span className="brand-count">{favorites.length}</span>}
            </button>

            <button className={iconButton} onClick={handleUserClick} aria-label="Account">
              {user ? <LogOut size={18} /> : <UserRound size={18} />}
            </button>

            <Link to="/cart" className={iconButton} aria-label="Cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="brand-count">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition lg:hidden ${mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        ref={mobileMenuRef}
        className={`fixed left-0 top-0 z-50 h-full w-[88%] max-w-sm border-r border-[var(--border-soft)] bg-[var(--surface-main)] p-5 shadow-2xl transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <img src="/img/logo.png" alt="Rang Raaz" className="h-12 w-auto" />
          <button className={iconButton} onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <div className="mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder="Search the store"
            className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-main)] outline-none"
          />
        </div>
        {renderNavigation(true)}
        {isAdmin && (
          <Link to="/dashboard" className="mt-4 block rounded-2xl border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--brand-pink)]">
            Admin Dashboard
          </Link>
        )}
      </aside>
    </header>
  );
};

export default Header;
