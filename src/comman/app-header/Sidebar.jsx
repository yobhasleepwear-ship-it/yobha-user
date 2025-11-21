import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, ChevronRight, User, Package, LogOut, Recycle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/yobhaLogo.png";
import LanguageSwitcher from "../../LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { countryOptions, CountrySelector } from "../../countryDropdown";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import * as localStorageService from "../../service/localStorageService";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSidebarCountry, setSelectedSidebarCountry] = useState(null);
  const [isGiftsHovered, setIsGiftsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isGiftsSubmenuOpen, setIsGiftsSubmenuOpen] = useState(false);
  const giftsSubmenuRef = useRef(null);
  const giftsHoverTimeoutRef = useRef(null);

  const resolveSavedCountry = () => {
    if (typeof window === "undefined") return countryOptions[0];
    try {
      const saved = window.localStorage.getItem("selectedCountry");
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = countryOptions.find((c) => c.code === parsed.code);
        return match || countryOptions[0];
      }
    } catch (error) {
      console.error("Unable to parse saved country", error);
    }
    return countryOptions[0];
  };

  useEffect(() => {
    setSelectedSidebarCountry(resolveSavedCountry());
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
      setIsAuthenticated(!!token);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const syncCountryFromStorage = () => {
      setSelectedSidebarCountry(resolveSavedCountry());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncCountryFromStorage);
      window.addEventListener("yobha-country-change", syncCountryFromStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", syncCountryFromStorage);
        window.removeEventListener("yobha-country-change", syncCountryFromStorage);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Close sub-sidebar when main sidebar closes
      setIsGiftsSubmenuOpen(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle clicks outside gifts submenu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (giftsSubmenuRef.current && !giftsSubmenuRef.current.contains(event.target)) {
        // Check if click is not on the gifts menu item
        const giftsMenuItem = event.target.closest('[data-gifts-menu]');
        if (!giftsMenuItem) {
          setIsGiftsHovered(false);
        }
      }
    };

    if (isGiftsHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGiftsHovered]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (giftsHoverTimeoutRef.current) {
        clearTimeout(giftsHoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSidebarCountryChange = (selectedCode) => {
    const chosen = countryOptions.find((option) => option.code === selectedCode);
    if (!chosen) return;
    setSelectedSidebarCountry(chosen);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedCountry", JSON.stringify(chosen));
      window.dispatchEvent(new CustomEvent("yobha-country-change", { detail: chosen }));
    }
  };

  const toggleAccordion = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    localStorageService.clearAllExcept(["selectedCountry", "cart"]);
    setIsAuthenticated(false);
    onClose();
    navigate("/login");
  };

  // Gifts submenu items
  const giftsSubmenuItems = [
    { label: "Gifts For Her", nav: "gifts-personalization", category: "Women" },
    { label: "Gifts For Him", nav: "gifts-personalization", category: "Men" },
    { label: "Gifts For Family", nav: "gifts-personalization", category: "Family" },
    { label: "Gifts For Kids", nav: "gifts-personalization", category: "kids" },
    { label: "Gifts For Pets", nav: "gifts-personalization", category: "PetWear" },
    { label: "Personalisation", nav: "personalization" },
  ];

  const mainNavigationItems = [
    { label: "Gifts & Personalization", nav: "gifts-personalization", giftCard: true, hasSubmenu: true },
    { label: "New", nav: "whats-new", special: true },
    { label: "Men", nav: "Men" },
    { label: "Women", nav: "Women" },
    { label: t("navbar.collectionsItems.petWear." + i18n.language), nav: "PetWear" },
    { label: "Family", nav: "Family" },
    { label: "Scrunchies", nav: "scrunchies" },
    { label: "Socks", nav: "socks" },
    { label: "Eye Masks", nav: "eyemasks" },
    { label: "Headbands", nav: "headband" },
    { label: "Cushions", nav: "cushions" },
    { label: "Bathrobe", nav: "bathrobe" },
    { label: "Towels", nav: "towels" },
    { label: t("navbar.collectionsItems.sleepwear." + i18n.language), nav: "Sleepwear" },
    { label: t("navbar.collectionsItems.loungewear." + i18n.language), nav: "Loungewear" },
    { label: t("navbar.collectionsItems.homewear." + i18n.language), nav: "Homewear" },
    { label: t("navbar.collectionsItems.petAccessories." + i18n.language), nav: "petaccessories" },
  ];

  if (!isOpen) return null;

  return typeof document !== "undefined"
    ? createPortal(
      <div className="fixed inset-0 z-[99999]">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={onClose}
        ></div>

        <aside className="absolute left-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl animate-slideInLeft border-r border-gray-200 flex flex-col z-[100000] font-futura-pt-light relative">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <Link to="/home" onClick={onClose}>
              <img src={logoImage} alt="YOBHA Logo" className="h-10 cursor-pointer" />
            </Link>
            <button
              className="text-black hover:text-gray-700 transition-all duration-300 p-2 hover:bg-gray-50"
              onClick={onClose}
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col flex-1 overflow-y-auto px-6 py-6 space-y-0">
            {mainNavigationItems.map((item, index) => {
              let routePath = `/products/${item.nav.replace(/\s/g, "-")}`;
              if (item.special) {
                routePath = `/products?sort=latest`;
              } else if (item.giftCard) {
                routePath = `/gifts-personalization`;
              }

              // Handle Gifts & Personalization with submenu
              if (item.hasSubmenu) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    data-gifts-menu
                    onMouseEnter={() => {
                      if (!isMobile) {
                        // Clear any pending timeout
                        if (giftsHoverTimeoutRef.current) {
                          clearTimeout(giftsHoverTimeoutRef.current);
                        }
                        setIsGiftsHovered(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) {
                        // Add delay before closing to allow mouse to move to submenu
                        giftsHoverTimeoutRef.current = setTimeout(() => {
                          setIsGiftsHovered(false);
                        }, 150);
                      }
                    }}
                  >
                    {/* Mobile: Button to open sub-sidebar */}
                    {isMobile && (
                      <button
                        onClick={() => setIsGiftsSubmenuOpen(true)}
                        className="flex items-center justify-between w-full py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                      >
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{item.label}</span>
                        <ChevronRight size={18} className="text-gray-700 ml-auto" />
                      </button>
                    )}
                    
                    {/* Desktop: Regular link */}
                    {!isMobile && (
                      <Link
                        to={routePath}
                        className="py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                        onClick={onClose}
                      >
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{item.label}</span>
                      </Link>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.label}
                  to={routePath}
                  className="py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                  onClick={onClose}
                >
                  <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{item.label}</span>
                </Link>
              );
            })}

            {/* Account Section */}
            <div className="pt-6 border-t border-gray-100 mt-2">
              <button
                onClick={() => toggleAccordion("account")}
                className="flex items-center justify-between w-full py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
              >
                <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.myAccount." + i18n.language)}</span>
                {expandedSections.account ? (
                  <ChevronDown size={18} className="text-gray-700" />
                ) : (
                  <ChevronRight size={18} className="text-gray-700" />
                )}
              </button>
              {expandedSections.account && (
                <div className="mt-2 animate-slideDown">
                  {!isAuthenticated ? (
                    <Link
                      to="/login"
                      className="block py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                      onClick={onClose}
                    >
                      <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.login." + i18n.language)}</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                        onClick={onClose}
                      >
                        <User size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.myAccount." + i18n.language)}</span>
                      </Link>
                      <Link
                        to="/buyback/all"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                        onClick={onClose}
                      >
                        <Recycle size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.buyback." + i18n.language)}</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                        onClick={onClose}
                      >
                        <Package size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.orders." + i18n.language)}</span>
                      </Link>
                      <button
                        onClick={() => {
                          onClose();
                          handleLogout();
                        }}
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light text-left w-full"
                      >
                        <LogOut size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">{t("navbar.account.logout." + i18n.language)}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Ship To Section */}
          {selectedSidebarCountry && (
            <div className="pt-6 border-t border-gray-100 mt-2">
              <p className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-black transition-all duration-300 border-b border-gray-50 font-light group font-futura-pt-light">SHIP TO</p>
              <CountrySelector
                value={selectedSidebarCountry?.code}
                onSelect={handleSidebarCountryChange}
                placeholder="Select country"
                buttonClassName="bg-white border border-gray-200"
                menuClassName="bg-white"
                optionClassName=""
              />
            </div>
          )}
              {/* Language Switcher */}
            <div className="pt-6 border-t border-gray-100 mt-2">
            <p className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-black transition-all duration-300 border-b border-gray-50 font-light group font-futura-pt-light">Choose Language</p>  
              <LanguageSwitcher />
            </div>
          </nav>

          {/* Desktop: Gifts Submenu - LV Inspired Design */}
          {isGiftsHovered && !isMobile && (
            <div
              ref={giftsSubmenuRef}
              className="absolute left-full top-0 h-full w-80 bg-white border-l border-gray-100 animate-slideInRight z-[100001] font-futura-pt-light overflow-y-auto"
              onMouseEnter={() => {
                // Clear any pending timeout when mouse enters submenu
                if (giftsHoverTimeoutRef.current) {
                  clearTimeout(giftsHoverTimeoutRef.current);
                }
                setIsGiftsHovered(true);
              }}
              onMouseLeave={() => {
                // Add delay before closing to allow mouse to return to main menu
                giftsHoverTimeoutRef.current = setTimeout(() => {
                  setIsGiftsHovered(false);
                }, 150);
              }}
            >
              {/* Submenu Header - LV Style */}
              <div className="flex items-center px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h3 className="h-10 flex items-center text-[13px] uppercase tracking-[0.3em] text-black font-light font-futura-pt-light">
                  Gifts & Personalization
                </h3>
              </div>

              {/* Submenu Items - LV Style */}
              <nav className="flex flex-col px-8 py-6 space-y-0">
                {giftsSubmenuItems.map((subItem) => {
                  let subRoutePath = subItem.nav;
                  if (subItem.category) {
                    subRoutePath = `/gifts-personalization?category=${subItem.category}`;
                  }
                  return (
                    <Link
                      key={subItem.label}
                      to={subRoutePath}
                      className="py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light hover:bg-gray-50/30"
                      onClick={onClose}
                    >
                      <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light inline-block">
                        {subItem.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </aside>

        {/* Mobile: Gifts Sub-sidebar - Slides in from right */}
        {isMobile && isGiftsSubmenuOpen && (
          <aside className="absolute right-0 top-0 h-full w-full bg-white shadow-2xl animate-slideInRightMobile border-l border-gray-200 flex flex-col z-[100002] font-futura-pt-light">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <button
                onClick={() => setIsGiftsSubmenuOpen(false)}
                className="flex items-center gap-2 text-black hover:text-gray-700 transition-all duration-300 p-2 hover:bg-gray-50"
              >
                <ArrowLeft size={20} />
                <span className="text-[13px] uppercase tracking-[0.25em] font-light font-futura-pt-light">Back</span>
              </button>
              <button
                className="text-black hover:text-gray-700 transition-all duration-300 p-2 hover:bg-gray-50"
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            {/* Submenu Title */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[13px] uppercase tracking-[0.3em] text-black font-light font-futura-pt-light">
                Gifts & Personalization
              </h3>
            </div>

            {/* Submenu Items */}
            <nav className="flex flex-col flex-1 overflow-y-auto px-6 py-6 space-y-0">
              {giftsSubmenuItems.map((subItem) => {
                let subRoutePath = subItem.nav;
                if (subItem.category) {
                  subRoutePath = `/gifts-personalization?category=${subItem.category}`;
                }
                return (
                  <Link
                    key={subItem.label}
                    to={subRoutePath}
                    className="py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group font-futura-pt-light"
                    onClick={() => {
                      setIsGiftsSubmenuOpen(false);
                      onClose();
                    }}
                  >
                    <span className="group-hover:border-b border-gray-800 transition-all duration-300 font-light font-futura-pt-light">
                      {subItem.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        <style jsx>{`
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
              animation: slideDown 0.3s ease-out forwards;
            }
            @keyframes slideInRight {
              0% {
                transform: translateX(-20px);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slideInRight {
              animation: slideInRight 0.3s ease forwards;
            }
            @keyframes slideInRightMobile {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(0);
              }
            }
            .animate-slideInRightMobile {
              animation: slideInRightMobile 0.3s ease forwards;
            }
          `}</style>
      </div>,
      document.body
    )
    : null;
};

export default Sidebar;

