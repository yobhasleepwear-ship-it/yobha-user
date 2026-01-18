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

  const baseButtonClasses = "w-full flex items-center justify-between gap-3 border border-gray-200/50 bg-white px-4 py-3 text-left text-sm md:text-base font-light text-gray-900 transition-all duration-300 focus:outline-none focus:border-gray-900 hover:border-gray-300 shadow-sm hover:shadow-md font-futura-pt-book";
  const baseMenuClasses = "absolute z-50 mt-2 w-full  max-h-auto md:max-h-80 overflow-y-auto bg-white border border-gray-200/50 shadow-lg font-futura-pt-book";
  const baseOptionClasses = "block w-full text-left px-4 py-3 text-sm md:text-base font-light text-gray-900 hover:bg-gray-50 transition-colors font-futura-pt-book";
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
        <span className="truncate text-left flex-1 font-light font-futura-pt-book">
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
        <div className={`${baseMenuClasses} ${menuAlignmentClass} ${menuClassName} max-h-60 overflow-y-auto pb-2` } role="listbox">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-futura-pt-light">
        <div
          className="bg-white border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 md:p-12 max-w-md w-full mx-4 transform transition-all duration-500 animate-fadeInUp text-black"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 border border-black/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c1.1046 0 2-.8954 2-2s-.8954-2-2-2-2 .8954-2 2 .8954 2 2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-light uppercase tracking-[0.22em]">
              Welcome to YOBHA
            </h3>
            <p className="text-sm font-light leading-relaxed text-black/70 mt-3">
              We couldn’t detect your location.
            </p>
            <p className="text-xs font-light text-black/60 mt-2 uppercase tracking-[0.25em]">Please select your country to continue</p>
          </div>

          <div className="space-y-4 text-left">
            <CountrySelector
              value={selectedCountry?.code}
              onSelect={handleSelectCountry}
              placeholder="Select your country"
              buttonClassName="bg-white border-black/15 text-sm tracking-[0.25em]"
              menuClassName="bg-white border-black/15"
              optionClassName="text-sm tracking-[0.22em]"
            />
          </div>

          <div className="mt-6 border-t border-black/10 pt-4 text-xs text-black/60 text-center">
            Select country to tailor prices and shipping.
          </div>
        </div>
      </div>
    );
  }

  // 🟢 Show detected confirmation (original)
  if (showConfirmation && detectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-futura-pt-light">
        <div
          className="bg-white border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 md:p-12 max-w-md w-full mx-4 transform transition-all duration-500 animate-fadeInUp text-black"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 border border-black/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c1.1046 0 2-.8954 2-2s-.8954-2-2-2-2 .8954-2 2 .8954 2 2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-light uppercase tracking-[0.22em]">
              Welcome to YOBHA
            </h3>
            <p className="text-sm font-light leading-relaxed text-black/70 mt-3">
              We detected your location as
            </p>
            <p className="text-lg font-light tracking-[0.18em] mt-2">
              {detectedCountry.label}
            </p>
            <p className="text-xs font-light text-black/60 mt-2 uppercase tracking-[0.25em]">
              Is this correct?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              className="w-full bg-black text-white py-4 px-8 font-light text-sm tracking-[0.28em] uppercase transition-all duration-200 hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              Yes, Continue
            </button>

            <CountrySelector
              value={selectedCountry?.code}
              onSelect={handleSelectCountry}
              placeholder="Or select your country"
              buttonClassName="bg-white border-black/15 text-sm tracking-[0.25em]"
              menuClassName="bg-white border-black/15"
              optionClassName="text-sm tracking-[0.22em]"
            />
          </div>

          <div className="mt-6 text-xs text-black/60 border-t border-black/10 pt-4 text-center">
            Adjust country to update pricing, duties and shipping times.
          </div>
        </div>
      </div>
    );
  }

  // 🟡 Loading while detecting
  if (!selectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-futura-pt-light">
        <div
          className="bg-white border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 md:p-12 max-w-sm w-full mx-4 transform transition-all duration-500 animate-fadeInUp text-black text-center"
        >
          <div className="text-center">
            <div className="w-16 h-16 border border-black/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v4m0 8v4m8-8h-4M8 12H4" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-light uppercase tracking-[0.22em] mb-2">
              Detecting Location
            </h3>
            <p className="text-sm font-light leading-relaxed text-black/70">
              Please wait while we detect your country.
            </p>

            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-black/70 rounded-full animate-bounce" style={{ animationDelay: "0.12s" }}></div>
              <div className="w-2 h-2 bg-black/50 rounded-full animate-bounce" style={{ animationDelay: "0.24s" }}></div>
            </div>
          </div>
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
      buttonClassName="text-gray-900"
      menuClassName="bg-white"
      optionClassName="text-gray-900"
    />
  );
};

export default CountryDropdown;
