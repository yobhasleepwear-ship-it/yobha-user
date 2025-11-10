import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const languages = [
    { code: "en", label: t("navbar.languageSwitcher.english.en") },
    { code: "hi", label: t("navbar.languageSwitcher.hindi.en") },
    { code: "ar", label: t("navbar.languageSwitcher.arabic.en") }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code); 
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr"; 
    setOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);
  const currentLabel = currentLanguage ? currentLanguage.label : i18n.language.toUpperCase();

  return (
    <div ref={containerRef} className="relative inline-block text-left w-full font-futura-pt-light">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="inline-flex w-full items-center justify-between gap-3 border border-gray-200 bg-white/90 px-5 py-3 text-xs font-light uppercase tracking-[0.28em] text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 hover:bg-white font-futura-pt-light"
      >
        <span className="flex-1 truncate text-left font-light font-futura-pt-light">{currentLabel}</span>
        <svg
          className={`h-4 w-4 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-full sm:w-36 border border-gray-200 bg-white shadow-xl z-50 font-futura-pt-light">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full text-left px-5 py-3 text-xs uppercase tracking-[0.28em] transition-colors duration-200 font-light font-futura-pt-light ${
                i18n.language === lang.code
                  ? "bg-premium-cream/60 text-black"
                  : "text-black hover:bg-premium-cream/40"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
