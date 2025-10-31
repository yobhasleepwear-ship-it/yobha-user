import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: t("navbar.languageSwitcher.english.en") },
    { code: "hi", label: t("navbar.languageSwitcher.hindi.en") },
    { code: "ar", label: t("navbar.languageSwitcher.arabic.en") }
  ];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code); 
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr"; 
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none"
      >
        {i18n.language.toUpperCase()}
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="origin-top-left absolute left-0 mt-2 w-full sm:w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
