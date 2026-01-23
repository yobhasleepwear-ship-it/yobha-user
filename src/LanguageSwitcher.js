import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const languages = [
    { code: "en", label: t("navbar.languageSwitcher.english.en") }
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
    <div ref={containerRef} className="relative inline-block text-left w-full font-futura-pt-book">
      <button
        disabled
        type="button"
        className="inline-flex w-full items-center justify-between gap-3 border border-gray-200 bg-white/90 px-5 py-3 text-sm md:text-base font-light text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 cursor-not-allowed opacity-75 font-futura-pt-book"
      >
        <span className="flex-1 truncate text-left font-light font-futura-pt-book">{currentLabel}</span>
        <svg
          className="h-4 w-4 transform transition-transform duration-200 rotate-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
