import React, { useEffect, useState } from "react";

const countryOptions = [
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

const CountryDropdown = ({ onConfirmed }) => {
  const [detectedCountry, setDetectedCountry] = useState(null); // detected by IP
  const [selectedCountry, setSelectedCountry] = useState(null); // confirmed by user
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if country is already saved
    const savedCountry = localStorage.getItem("selectedCountry");
    if (savedCountry) {
      const country = JSON.parse(savedCountry);
      setSelectedCountry(country);
      onConfirmed?.(country); // proceed directly
      return;
    }

    // Detect country via IP
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const userCountry = countryOptions.find(
          (c) => c.code === data.country_code
        );
        if (userCountry) {
          setDetectedCountry(userCountry);
          setShowConfirmation(true); // show confirmation to user
        }
      })
      .catch((err) => console.error("Location fetch error:", err));
  }, [onConfirmed]);

  const handleConfirm = () => {
    setSelectedCountry(detectedCountry);
    localStorage.setItem("selectedCountry", JSON.stringify(detectedCountry));
    setShowConfirmation(false);
    onConfirmed?.(detectedCountry); // proceed only after user clicks
  };

  const handleChange = (e) => {
    const selected = countryOptions.find((c) => c.code === e.target.value);
    setSelectedCountry(selected);
    localStorage.setItem("selectedCountry", JSON.stringify(selected));
    onConfirmed?.(selected); // user confirmed manually
  };

  if (showConfirmation && detectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 md:p-12 max-w-md mx-4 transform transition-all duration-500 animate-fadeInUp"
             style={{ fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" }}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              onClick={handleConfirm}
              className="w-full bg-luxury-gold text-white py-4 px-8 rounded-2xl font-light text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-xl hover:brightness-95 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-luxury-gold/30"
            >
              Yes, Continue
            </button>
            
            <div className="relative">
              <select 
                onChange={handleChange} 
                defaultValue=""
                className="w-full appearance-none bg-premium-cream border border-gray-200 rounded-2xl py-4 px-6 text-text-dark font-light text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold/30 transition-all duration-300 hover:bg-white cursor-pointer"
              >
                <option value="" disabled className="text-text-light">
                  Or select your country
                </option>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code} className="text-text-dark">
                    {c.label}
                  </option>
                ))}
              </select>
              
              {/* Custom Dropdown Arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-luxury-rose-gold/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    );
  }

  if (!selectedCountry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-8 md:p-12 max-w-sm mx-4 transform transition-all duration-500 animate-fadeInUp"
             style={{ fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" }}>
          
          {/* Loading Animation */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-rose-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-light text-black tracking-wider uppercase mb-2">
              Detecting Location
            </h3>
            <p className="text-text-medium text-sm font-light leading-relaxed">
              Please wait while we detect your country...
            </p>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-luxury-rose-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-luxury-rose-gold/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" style={{ fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" }}>
      <select 
        value={selectedCountry.code} 
        onChange={handleChange}
        className="appearance-none bg-premium-cream border border-gray-200 rounded-2xl py-3 px-6 pr-12 text-text-dark font-light text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold/30 transition-all duration-300 hover:bg-white cursor-pointer min-w-[200px] shadow-sm hover:shadow-md"
      >
        {countryOptions.map((c) => (
          <option key={c.code} value={c.code} className="text-text-dark">
            {c.label}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover:scale-110">
        <svg className="w-4 h-4 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-luxury-gold/20 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default CountryDropdown;
