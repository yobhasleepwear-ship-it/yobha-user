import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, User, Heart, Search, Loader2, LogOut } from "lucide-react";
import { BsBag } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import * as localStorageService from "../../service/localStorageService";
import logoImage from "../../assets/yobhaLogo.png";
import { useSelector } from "react-redux";
import { getFilteredProducts } from "../../service/productAPI";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";

const HeaderWithSidebar2 = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isHomePage = location.pathname === "/home";

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
  const accountDropdownRef = useRef(null);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
 const [isScrolled, setHasScrolled] = useState(false); 

useEffect(() => {
  const handleScroll = () => {
    setHasScrolled(true);
  };

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("wheel", handleScroll);       // desktop
  window.addEventListener("touchmove", handleScroll);  // mobile

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("wheel", handleScroll);
    window.removeEventListener("touchmove", handleScroll);
  };
}, []);
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
    localStorageService.clearAllExcept(["selectedCountry", "cart"]);
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
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setMobileAccountOpen(false);
        setAccountDropdownOpen(false);
      }
    };

    if (searchOpen || mobileAccountOpen || accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [searchOpen, mobileAccountOpen, accountDropdownOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMobileAccountOpen(false);
      setAccountDropdownOpen(false);
    }
  }, [isAuthenticated]);

  // Determine if header is transparent (home page, not scrolled, not hovered)
  const isHeaderTransparent = isHomePage && !isScrolled && !isHovered;

  const headerClasses = `
      fixed top-0 left-0 right-0  z-[1200] border-b transition-all duration-500
    ${isHomePage
      ? (isScrolled || isHovered
        ? "bg-white/95 backdrop-blur-md border-gray-200 shadow-[0_4px_14px_rgba(15,23,42,0.04)] "
        : "bg-transparent border-transparent ")
      : "sticky top-0 relative  z-[1200] bg-white/95 backdrop-blur-md border-b border-gray-200 font-sweet-sans shadow-[0_4px_14px_rgba(15,23,42,0.04)]"}
  `;
  
  // Icon color classes based on header transparency
  const iconColorClass = isHeaderTransparent ? "text-white hover:text-gray-200" : "text-black hover:text-gray-700";

  return (
    <>

      <header
        className={headerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className=" mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 md:py-4 lg:py-5 relative">

          {/* Left Side - Menu & Search Icon (All Devices) */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Menu Icon */}
              <button
              className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 focus:outline-none ${iconColorClass} transition-colors duration-300`}
                onClick={() => {
                  setSidebarOpen(true);
                  setSearchOpen(false);
                }}
              >
              <Menu size={18} className="md:w-5 md:h-5" />
              </button>

            {/* Search Icon */}
              <button
              className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 ${iconColorClass} transition-colors duration-300`}
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setSidebarOpen(false);
                }}
                title="Search"
              >
              <Search size={18} className="md:w-5 md:h-5" />
              </button>
            </div>

          {/* Center - Logo (All Devices) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
            <Link to="/home" className="flex items-center justify-center">
              <img
                src={logoImage}
                alt="YOBHA Logo"
                className="h-7 md:h-8 lg:h-9 transition-all duration-300 hover:scale-105"
                style={{ filter: isHeaderTransparent ? "brightness(0) invert(1)" : "none" }}
              />
            </Link>
          </div>

          {/* Right Side - Wishlist, Cart & User (All Devices) */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 relative flex-shrink-0">
            {/* Wishlist Icon */}
              <Link
                to="/wishlist"
              className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 ${iconColorClass} transition-colors duration-300 relative`}
                title="Wishlist"
              >
              <Heart size={18} className="md:w-5 md:h-5" strokeWidth={1.8} />
              </Link>

            {/* Cart Icon */}
              <Link
                to="/cart"
              className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 ${iconColorClass} transition-colors duration-300 relative overflow-visible`}
                title="Shopping Cart"
              >
                <BsBag
                  size={18}
                className={`md:w-5 md:h-5 transition-all duration-300 ${cartAnimation ? "scale-110" : "scale-100"}`}
                />
                {cartCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 ${isHeaderTransparent ? "bg-white text-black" : "bg-black text-white"} text-[10px] md:text-xs w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center font-light shadow-lg transition-all duration-300 ${cartAnimation ? "scale-125" : "scale-100"}`}>
                    {cartCount}
                  </span>
                )}
              </Link>

            {/* User Icon */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setMobileAccountOpen((prev) => !prev);
                    setAccountDropdownOpen((prev) => !prev);
                  }
                }}
                className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 ${iconColorClass} transition-colors duration-300`}
                title={isAuthenticated ? "Account" : "Login"}
              >
                <User size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={1.8} />
              </button>

              {/* Account Dropdown - Mobile */}
              {isAuthenticated && mobileAccountOpen && (
                <div 
                  className="md:hidden absolute right-0 top-12 z-[1500] bg-white border border-gray-200 shadow-xl overflow-hidden text-xs uppercase font-futura-pt-light min-w-[180px]"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileAccountOpen(false);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Close account menu"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/account');
                      setMobileAccountOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-black hover:bg-gray-100 active:bg-gray-200 transition-colors duration-300 mt-6 w-full text-left touch-manipulation cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <User size={16} />
                    <span>Account</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileAccountOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-black hover:bg-gray-100 active:bg-gray-200 transition-colors duration-300 w-full text-left touch-manipulation cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Account Dropdown - Desktop */}
              {isAuthenticated && accountDropdownOpen && (
                <div
                  ref={accountDropdownRef}
                  className="hidden md:block absolute right-0 top-12 z-50"
                >
                    <div className="bg-white shadow-2xl border border-gray-100 py-2 min-w-[200px] relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 transition-colors duration-200"
                        onClick={() => setAccountDropdownOpen(false)}
                        aria-label="Close account menu"
                      >
                        <X size={16} strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigate('/account');
                        }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs md:text-sm text-black uppercase tracking-widest transition-all duration-300 pt-6 text-left"
                      >
                        <User size={16} />
                        <span>My Account</span>
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          handleLogout();
                        }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs md:text-sm text-black uppercase tracking-widest transition-all duration-300 text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Expandable Search Bar (All Devices) */}
        {searchOpen && (
          <div className="w-full border-t border-gray-200 bg-white animate-slideDown">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
              <div className="relative" ref={searchRef}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("navbar.placeholders.search." + i18n.language)}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm md:text-base bg-gray-50 transition-all duration-300 hover:bg-white"
                      autoFocus
                    />
                    {searchLoading && (
                      <Loader2 size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-2xl z-50 max-h-96 overflow-y-auto mt-2 rounded-lg">
                    <div className="p-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSearchResultClick(product)}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300"
                      >
                          <div className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop&crop=center"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-light text-black text-sm leading-tight truncate">{product.name}</h4>
                            <p className="text-gray-500 text-xs uppercase tracking-wide">{product.category}</p>
                          <p className="text-black font-light text-sm">Rs. {product.price} INR</p>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-2xl z-50 p-6 mt-2 rounded-lg">
                    <p className="text-gray-500 text-sm text-center">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


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
