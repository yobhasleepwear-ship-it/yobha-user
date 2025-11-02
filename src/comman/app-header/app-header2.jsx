import React, { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, Menu, X, User, Heart, Package, Search, Loader2 } from "lucide-react";
import { BsBag } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import * as localStorageService from "../../service/localStorageService";
import logoImage from "../../assets/yobhaLogo.png";
import { useSelector } from "react-redux";
import LanguageSwitcher from "../../LanguageSwitcher";
import { getFilteredProducts } from "../../service/productAPI";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";

const HeaderWithSidebar2 = () => {
  const { t, i18n } = useTranslation();
  const cartCount = useSelector(state => state.cart.count);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const topBannerItems = [
    {
      icon: "♻️",
      label: t("navbar.topbar.buyback." + i18n.language),
      to: "/buyback"
    },
    {
      icon: "🛡️",
      label: "Anti-Viral Finish",
      to: "/fabric-protection#anti-viral"
    },
    {
      icon: "🧼",
      label: "Anti-Microbial Fabric",
      to: "/fabric-protection#anti-microbial"
    }
  ];

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth); // update if storage changes
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Trigger cart animation only when cart count increases (product added)
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize previous count on first load
    if (!isInitialized) {
      setPrevCartCount(cartCount);
      setIsInitialized(true);
      return;
    }

    // Only animate if cart count increased (product was added)
    if (cartCount > prevCartCount && cartCount > 0) {
      setCartAnimation(true);
      const timer = setTimeout(() => setCartAnimation(false), 600);
      setPrevCartCount(cartCount);
      return () => clearTimeout(timer);
    } else if (cartCount !== prevCartCount) {
      // Update previous count without animation for other changes
      setPrevCartCount(cartCount);
    }
  }, [cartCount, prevCartCount, isInitialized]);


  // Disable background scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Logout function
  const handleLogout = () => {
    localStorageService.clearAllExcept(["selectedCountry"]);
    setIsAuthenticated(false);
    navigate("/login");
  };



  // Search functionality
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await getFilteredProducts({
        q: query,
        category: "",
        subCategory: "",
        minPrice: null,
        maxPrice: null,
        pageNumber: 1,
        pageSize: 10,
        sort: "latest",
        country: null,
      });


      if (response?.success && response.data) {
        setSearchResults(response.data.items || []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    if (query.trim()) {
      // Debounce search by 300ms
      window.searchTimeout = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (product) => {
    navigate(`/productDetail/${product.id}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  return (
    <>



      <header
        className="relative w-full z-[1200] bg-white/95 backdrop-blur-md border-b border-gray-100/50 font-sweet-sans"
      >

        <div
          className="bg-black text-white relative overflow-hidden font-sweet-sans"
        >
          <div className="top-banner">
            <div className="top-banner__track">
              {[0, 1].map((repeat) => (
                <React.Fragment key={`banner-segment-${repeat}`}>
                  {topBannerItems.map((item, index) => {
                    const key = `banner-item-${repeat}-${index}`;
                    return (
                      <Link
                        key={key}
                        to={item.to}
                        className="top-banner__item top-banner__item--link"
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 md:py-4 lg:py-5">

          {/* Mobile Layout */}
          <div className="flex items-center justify-between w-full md:hidden">
            {/* Left Side - Mobile Menu & Search */}
            <div className="flex items-center gap-2">
              <button
                className="flex items-center justify-center w-7 h-7 focus:outline-none text-black hover:text-gray-700 transition-colors duration-300"
                onClick={() => {
                  setSidebarOpen(true);
                  setSearchOpen(false);
                }}
              >
                <Menu size={18} />
              </button>

              <button
                className="flex items-center justify-center w-7 h-7 text-black hover:text-gray-700 transition-colors duration-300"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setSidebarOpen(false);
                }}
                title="Search"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Center - Logo (Mobile) */}
            <Link
              to="/"
              className="flex items-center"
            >
              <img
                src={logoImage}
                alt="YOBHA Logo"
                className="h-7"
              />
            </Link>

            {/* Right Side - Wishlist & Cart (Mobile) */}
            <div className="flex items-center gap-1">
              {/* Wishlist Icon - Mobile */}
                  <Link
                to="/login"
                className="flex items-center justify-center w-7 h-7 text-black hover:text-gray-700 transition-colors duration-300 relative"               
              >
                <User size={18} strokeWidth={1.8} />
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center justify-center w-7 h-7 text-black hover:text-gray-700 transition-colors duration-300 relative"
                title="Wishlist"
              >
                <Heart size={18} strokeWidth={1.8} />
              </Link>

              {/* Cart Icon - Mobile */}
              <Link
                to="/cart"
                className="flex items-center justify-center w-7 h-7 text-black hover:text-gray-700 transition-colors duration-300 relative overflow-visible"
                title="Shopping Cart"
              >
                <BsBag
                  size={18}
                  className={`transition-all duration-300 ${cartAnimation ? "scale-110" : "scale-100"}`}
                />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 bg-luxury-gold text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${cartAnimation ? "scale-125" : "scale-100"}`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop/Tablet Layout - Luxury Minimal Design */}
          <div className="hidden md:flex items-center w-full">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-4 md:space-x-5 lg:space-x-6 flex-shrink-0">
              {/* Hamburger Menu Icon */}
              <button
                className="flex items-center justify-center w-8 h-8 focus:outline-none text-black hover:text-gray-700 transition-colors duration-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>

              {/* YOBHA Logo */}
              <Link
                to="/"
                className="flex items-center group"
              >
                <img
                  src={logoImage}
                  alt="YOBHA Logo"
                  className="h-7 md:h-8 lg:h-9 transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Navigation Menu - Premium Typography */}
              <nav className="flex items-center space-x-4 md:space-x-5 lg:space-x-6">
                <Link
                  to="/products/Sleepwear"
                  className="text-black hover:text-gray-900 transition-all duration-500 font-light text-xs md:text-sm tracking-widest uppercase relative group whitespace-nowrap"
                >
                  Sleepwear
                  <span className="absolute -bottom-2 left-0 h-px bg-gray-900 transition-all duration-500 ease-out w-0 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/products/Loungewear"
                  className="text-black hover:text-gray-900 transition-all duration-500 font-light text-xs md:text-sm tracking-widest uppercase relative group whitespace-nowrap"
                >
                  Loungewear
                  <span className="absolute -bottom-2 left-0 h-px bg-gray-900 transition-all duration-500 ease-out w-0 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/products/Homewear"
                  className="text-black hover:text-gray-900 transition-all duration-500 font-light text-xs md:text-sm tracking-widest uppercase relative group whitespace-nowrap"
                >
                  Homewear
                  <span className="absolute -bottom-2 left-0 h-px bg-gray-900 transition-all duration-500 ease-out w-0 group-hover:w-full"></span>
                </Link>
                    <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-black hover:text-gray-900 transition-all duration-500 font-light text-xs md:text-sm tracking-widest uppercase relative group whitespace-nowrap"
                    >
                  Explore
                  <span className="absolute -bottom-2 left-0 h-px bg-gray-900 transition-all duration-500 ease-out w-0 group-hover:w-full"></span>
                    </button>
              </nav>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 mx-4 md:mx-6 lg:mx-8 min-w-0">
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("navbar.placeholders.search." + i18n.language)}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold/30 text-xs md:text-sm bg-gray-50/50 transition-all duration-300 hover:bg-white"
                  />
                  {searchLoading && (
                    <Loader2 size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results - Luxury Design */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-2xl z-50 max-h-96 overflow-y-auto mt-2">
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchResultClick(product)}
                          className="flex items-center gap-4 p-4 hover:bg-luxury-gold/5 cursor-pointer transition-all duration-300"
                        >
                          <div className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img
                              src={product.images?.[0] || "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop&crop=center"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-black text-sm leading-tight truncate">{product.name}</h4>
                            <p className="text-gray-500 text-xs uppercase tracking-wide">{product.category}</p>
                            <p className="text-luxury-gold font-semibold text-sm">Rs. {product.price} INR</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results - Luxury Design */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-2xl z-50 p-6 mt-2">
                    <p className="text-gray-500 text-sm text-center">placeholder={t("navbar.placeholders.search." + i18n.language)}"{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Utilities */}
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
              {/* Wishlist Icon - Desktop Only */}
              <Link
                to="/wishlist"
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-black hover:text-luxury-gold transition-all duration-300 rounded-full hover:bg-luxury-gold/10"
                title={t("navbar.wishlist.tooltip." + i18n.language)}
              >
                <Heart size={18} className="md:w-5 md:h-5" strokeWidth={1.5} />
              </Link>

              {/* Account Icon - Luxury Design */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-black hover:text-luxury-gold transition-all duration-300 rounded-full hover:bg-luxury-gold/10"
                    title={t("navbar.account.myAccount." + i18n.language)}
                    onClick={() => navigate('/account')}
                  >
                    <User size={18} className="md:w-5 md:h-5" strokeWidth={1.5} />
                  </button>

                  {/* User Dropdown - Luxury Design */}
                  <div className="absolute top-12 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-white shadow-2xl border border-gray-100 p-3 min-w-[220px]">
                      <div className="space-y-1">
                        <Link
                          to="/account"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-luxury-gold/5 transition-all duration-300 text-xs md:text-sm text-black hover:text-black font-normal uppercase tracking-widest"
                        >
                          <User size={16} />
                          <span>{t("navbar.account.myAccount." + i18n.language)}</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-luxury-gold/5 transition-all duration-300 text-xs md:text-sm text-black hover:text-black font-normal uppercase tracking-widest"
                        >
                          <Package size={16} />
                          <span>{t("navbar.account.orders." + i18n.language)}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 text-black hover:text-gray-900 transition-all duration-500 rounded-full hover:bg-luxury-gold/10"
                  title={t("navbar.account.login." + i18n.language)}
                >
                  <User size={18} className="md:w-5 md:h-5" strokeWidth={1.5} />
                  <span className="hidden sm:inline font-normal text-xs md:text-sm tracking-widest uppercase">{t("navbar.account.login." + i18n.language)}</span>
                </Link>
              )}

              {/* Cart Icon - Luxury Design */}
              <Link
                to="/cart"
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-black hover:text-luxury-gold transition-all duration-300 relative rounded-full hover:bg-luxury-gold/10 overflow-visible"
                title={t("header.cart")}
              >
                <BsBag
                  size={18}
                  className={`md:w-5 md:h-5 transition-all duration-300 ${cartAnimation ? "scale-110" : "scale-100"}`}
                />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 bg-luxury-gold text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 ${cartAnimation ? "scale-125" : "scale-100"}`}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Logout Button - Luxury Design */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-black hover:text-gray-900 transition-all duration-500 rounded-full hover:bg-luxury-gold/10"
                  title={t("navbar.account.logout." + i18n.language)}
                >
                  <LogOut size={16} className="md:w-4 md:h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline font-normal text-xs md:text-sm tracking-widest uppercase">{t("navbar.account.logout." + i18n.language)}</span>
                </button>
              )}

              {/* Language Switcher */}
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Search Section - Mobile Only */}
        {searchOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
            <div className="max-w-[1600px] mx-auto px-4 py-4">
              {/* Mobile Search Input */}
              <div className="relative" ref={searchRef}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("navbar.placeholders.search." + i18n.language)}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent text-base"
                    />
                    {searchLoading && (
                      <Loader2 size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-300 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Results - Mobile */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSearchResultClick(product)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-200 flex-shrink-0">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop&crop=center"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-black text-sm leading-tight truncate">{product.name}</h4>
                          <p className="text-gray-600 text-xs">{product.category}</p>
                          <p className="text-black font-medium text-sm">Rs. {product.price} INR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results - Mobile */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 p-4">
                    <p className="text-gray-500 text-sm text-center">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        <style jsx>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideInLeft {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease forwards;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
        <style jsx global>{`
        /* Premium Font Family for Headers */
        header, .header-font {
          font-family: 'SweetSans', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
        }
        /* Enhanced Typography for Luxury Feel */
        .luxury-text {
          font-family: 'SweetSans', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .luxury-text-bold {
          font-family: 'SweetSans', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        /* Normal Font Weight for Navigation */
        nav, .nav-text {
          font-weight: 400 !important;
        }
        /* Dark Color for Navbar Text */
        .luxury-text, .luxury-text-bold, nav, .nav-text {
          color: #2c2c2c !important;
        }
        /* Tracking Wide for Premium Feel */
        .tracking-wide {
          letter-spacing: 0.025em;
        }

        /* Marquee styles */
        .top-banner {
          position: relative;
          overflow: hidden;
          padding: 0.4rem 0;
        }

        .top-banner__track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: 2.5rem;
          padding: 0 1.5rem;
          white-space: nowrap;
          animation: topBannerMarquee 20s linear infinite;
          will-change: transform;
        }

        .top-banner__item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .top-banner__item span[aria-hidden="true"] {
          font-size: 0.8rem;
        }

        .top-banner__item--link {
          color: inherit;
          transition: opacity 0.3s ease;
        }

        .top-banner__item--link:hover {
          opacity: 0.85;
        }

        @keyframes topBannerMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .top-banner__track {
            gap: 1.5rem;
            padding: 0 1rem;
          }

          .top-banner__item {
            font-size: 0.62rem;
            letter-spacing: 0.22em;
          }
        }
      `}</style>
      </header>
    </>
  );
};

export default HeaderWithSidebar2;
