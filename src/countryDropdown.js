import React, { useEffect, useState, useRef } from "react";

export const countryOptions = [
  { code: "IN", label: "India" },
  { code: "AE", label: "United Arab Emirates (UAE)" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "QA", label: "Qatar" },
  { code: "KW", label: "Kuwait" },
  { code: "OM", label: "Oman" },
  { code: "BH", label: "Bahrain" },
  { code: "JO", label: "Jordan" },
  { code: "LB", label: "Lebanon" },
  { code: "EG", label: "Egypt" },
  { code: "IQ", label: "Iraq" },
];

export const CountrySelector = ({
  value,
  onSelect,
  placeholder = "Select country",
  buttonClassName = "",
  menuClassName = "",
  optionClassName = "",
  align = "left",
  wrapperClassName = "",
  style,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = countryOptions.find((option) => option.code === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setOpen(false);
    onSelect?.(code);
  };

  const baseButtonClasses = "w-full flex items-center justify-between gap-3 border border-gray-200 bg-white/90 px-5 py-3 text-left text-xs font-light uppercase tracking-[0.28em] text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 focus:border-luxury-gold/40 hover:bg-white";
  const baseMenuClasses = "absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-xl";
  const baseOptionClasses = "block w-full text-left px-5 py-3 text-xs uppercase tracking-[0.28em] text-black hover:bg-premium-cream/60 transition-colors";
  const menuAlignmentClass = align === "right" ? "right-0" : "left-0";

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName}`} style={style}>
      <button
        type="button"
        className={`${baseButtonClasses} ${buttonClassName}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`${baseMenuClasses} ${menuAlignmentClass} ${menuClassName}`} role="listbox">
          {countryOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => handleSelect(option.code)}
              className={`${baseOptionClasses} ${optionClassName}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CountryDropdown = ({ onConfirmed }) => {
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [apiFailed, setApiFailed] = useState(false); // 🆕 handle failure

  useEffect(() => {
    // Check if user already selected
    const savedCountry = localStorage.getItem("selectedCountry");
    if (savedCountry) {
      const country = JSON.parse(savedCountry);
      setSelectedCountry(country);
      onConfirmed?.(country);
      return;
    }

    // Detect via IP
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const userCountry = countryOptions.find(
          (c) => c.code === data.country_code
        );
        if (userCountry) {
          setDetectedCountry(userCountry);
          setShowConfirmation(true);
        } else {
          setApiFailed(true);
        }
      })
      .catch((err) => {
        console.error("Location fetch error:", err);
        setApiFailed(true);
      });
  }, [onConfirmed]);

  const handleSelectCountry = (code) => {
    const selected = countryOptions.find((c) => c.code === code);
    if (!selected) return;

    setSelectedCountry(selected);
    localStorage.setItem("selectedCountry", JSON.stringify(selected));
    setShowConfirmation(false);
    setApiFailed(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("yobha-country-change", { detail: selected }));
    }

    onConfirmed?.(selected);
  };

  const handleConfirm = () => {
    if (detectedCountry?.code) {
      handleSelectCountry(detectedCountry.code);
    }
  };

  // 🟢 If API fails → show same themed modal with manual selection
  if (apiFailed && !selectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 md:p-12 max-w-md mx-4 transform transition-all duration-500 animate-fadeInUp"
          style={{
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-light text-black tracking-wider uppercase mb-2">
              Welcome to YOBHA
            </h3>
            <p className="text-text-medium text-sm font-light leading-relaxed">
              We couldn’t detect your location.
            </p>
            <p className="text-text-light text-xs font-light mt-2">
              Please select your country to continue.
            </p>
          </div>

          <div className="space-y-4">
            <CountrySelector
              value={selectedCountry?.code}
              onSelect={handleSelectCountry}
              placeholder="Select your country"
              buttonClassName="bg-premium-cream text-text-dark text-sm tracking-[0.25em]"
              menuClassName="bg-white"
              optionClassName="text-sm tracking-[0.22em]"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-4 left-4 w-1 h-1 bg-luxury-rose-gold/40 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>
    );
  }

  // 🟢 Show detected confirmation (original)
  if (showConfirmation && detectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 md:p-12 max-w-md mx-4 transform transition-all duration-500 animate-fadeInUp"
          style={{
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-light text-black tracking-wider uppercase mb-2">
              Welcome to YOBHA
            </h3>
            <p className="text-text-medium text-sm font-light leading-relaxed">
              We detected your location as
            </p>
            <p className="text-luxury-gold font-medium text-lg tracking-wide mt-2">
              {detectedCountry.label}
            </p>
            <p className="text-text-light text-xs font-light mt-2">
              Is this correct?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              className="w-full bg-luxury-gold text-white py-4 px-8 font-light text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-xl hover:brightness-95 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-luxury-gold/30"
            >
              Yes, Continue
            </button>

            <CountrySelector
              value={selectedCountry?.code}
              onSelect={handleSelectCountry}
              placeholder="Or select your country"
              buttonClassName="bg-premium-cream text-text-dark text-sm tracking-[0.25em]"
              menuClassName="bg-white"
              optionClassName="text-sm tracking-[0.22em]"
            />
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-4 left-4 w-1 h-1 bg-luxury-rose-gold/40 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>
    );
  }

  // 🟡 Loading while detecting
  if (!selectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 md:p-12 max-w-sm mx-4 transform transition-all duration-500 animate-fadeInUp"
          style={{
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-rose-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-light text-black tracking-wider uppercase mb-2">
              Detecting Location
            </h3>
            <p className="text-text-medium text-sm font-light leading-relaxed">
              Please wait while we detect your country...
            </p>

            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-luxury-rose-gold rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-4 left-4 w-1 h-1 bg-luxury-rose-gold/40 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>
    );
  }

  // ✅ Final small dropdown (after confirm)
  return (
    <CountrySelector
      value={selectedCountry?.code}
      onSelect={handleSelectCountry}
      placeholder="Select your country"
      buttonClassName="min-w-[200px] text-text-dark text-sm tracking-[0.25em]"
      menuClassName="bg-white"
      optionClassName="text-sm tracking-[0.22em]"
    />
  );
};

export default CountryDropdown;
