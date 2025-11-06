import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, ChevronRight, User, Package, LogOut, Recycle } from "lucide-react";
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
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const mainNavigationItems = [
    { label: "What's New", nav: "whats-new", special: true },
    { label: "Men", nav: "Men" },
    { label: "Women", nav: "Women" },
    { label: t("navbar.collectionsItems.petWear." + i18n.language), nav: "PetWear" },
    { label: "Family", nav: "Family" },
    { label: "Gifts - Personalised", nav: "gifts-personalised" },
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

        <aside className="absolute left-0 top-0 h-full w-80 md:w-96 max-w-[90vw] bg-white shadow-2xl animate-slideInLeft border-r border-gray-200 flex flex-col z-[100000] font-sweet-sans">
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

          {/* Ship To Section */}
          {selectedSidebarCountry && (
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gray-700 mb-3 font-light">Ship To</p>
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

          {/* Main Navigation */}
          <nav className="flex flex-col flex-1 overflow-y-auto px-6 py-6 space-y-0">
            {mainNavigationItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.special ? `/products?sort=latest` : `/products/${item.nav.replace(/\s/g, "-")}`}
                className="py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
                onClick={onClose}
              >
                <span className="group-hover:border-b border-gray-800 transition-all duration-300">{item.label}</span>
              </Link>
            ))}

            {/* Account Section */}
            <div className="pt-6 border-t border-gray-100 mt-2">
              <button
                onClick={() => toggleAccordion("account")}
                className="flex items-center justify-between w-full py-4 text-[13px] uppercase tracking-[0.25em] text-gray-800 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
              >
                <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.myAccount." + i18n.language)}</span>
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
                      className="block py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
                      onClick={onClose}
                    >
                      <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.login." + i18n.language)}</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
                        onClick={onClose}
                      >
                        <User size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.myAccount." + i18n.language)}</span>
                      </Link>
                      <Link
                        to="/buyback"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
                        onClick={onClose}
                      >
                        <Recycle size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.buyback." + i18n.language)}</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group"
                        onClick={onClose}
                      >
                        <Package size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.orders." + i18n.language)}</span>
                      </Link>
                      <button
                        onClick={() => {
                          onClose();
                          handleLogout();
                        }}
                        className="flex items-center gap-3 py-4 text-[13px] uppercase tracking-[0.25em] text-gray-600 transition-all duration-300 hover:text-black border-b border-gray-50 font-light group text-left w-full"
                      >
                        <LogOut size={16} />
                        <span className="group-hover:border-b border-gray-800 transition-all duration-300">{t("navbar.account.logout." + i18n.language)}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="pt-6 border-t border-gray-100 mt-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </aside>

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
          `}</style>
      </div>,
      document.body
    )
    : null;
};

export default Sidebar;

