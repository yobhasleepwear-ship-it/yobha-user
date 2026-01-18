import React, { useEffect, useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/yobhaLogo.png";
import { SubscribeNewsletter } from "../../service/notification";
import { message } from "../toster-message/ToastContainer";
import { countryOptions, CountrySelector } from "../../countryDropdown";
const Footer = () => {
const [newsletter , setNewsletter]=useState("")
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

  const [selectedSidebarCountry, setSelectedSidebarCountry] = useState(resolveSavedCountry);

  useEffect(() => {
    const syncCountryFromStorage = () => setSelectedSidebarCountry(resolveSavedCountry());

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
  const handleSidebarCountryChange = (selectedCode) => {
    const chosen = countryOptions.find((option) => option.code === selectedCode);
    if (!chosen) return;

    setSelectedSidebarCountry(chosen);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedCountry", JSON.stringify(chosen));
      window.dispatchEvent(new CustomEvent("yobha-country-change", { detail: chosen }));
      // Refresh the page to update country in footer and other places
      window.location.reload();
    }
  };

  const handleNewsSubscribe = () => {
    const payload = {
      "email": newsletter,
      "countryCode": "",
      "phoneNumber": ""
    }
    try {
      SubscribeNewsletter(payload)
      message.success("Subscribed successfully")
    }
    catch {
      message.error("something went wrong")
    }
  }
  return (
    <footer
      className="bg-premium-cream relative z-10 border-t border-text-light/20 font-futura-pt-light"
    >
      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-8">

          {/* Brand & About */}
          <div className="space-y-5">
            <div className="text-3xl font-light text-black">
              <Link
                to="/"
                className="flex items-center"
              >
                <img
                  src={logoImage}
                  alt="YOBHA Logo"
                  className="h-8 md:h-10"
                />
              </Link>
            </div>
            <p className="text-black text-sm leading-relaxed font-light font-futura-pt-light">
              Premium comfortwear for your ultimate comfort. Designed with care, elegance, and style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-light mb-6 text-black font-futura-pt-book">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/home"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-light mb-6 text-black font-futura-pt-book">
              Policies
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/return-policy"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-black font-light hover:text-gray-600 transition-colors duration-300 font-futura-pt-light"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
             <div className=" border-b border-gray-200 bg-premium-cream/70">
                              <p className="text-sm text-black font-light mb-3 font-futura-pt-book">Ship To</p>
                              <CountrySelector
                                value={selectedSidebarCountry?.code}
                                onSelect={handleSidebarCountryChange}
                                placeholder="Select country"
                                buttonClassName="bg-white/90 shadow-sm"
                                menuClassName="bg-white"
                                optionClassName=""
                              />
                            </div>
            <div>
              <h3 className="text-sm font-light mb-4 text-black font-futura-pt-book">
                Newsletter
              </h3>
              <p className="text-black font-light text-sm mb-4 font-futura-pt-light">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md lg:max-w-none">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletter}
                  onChange={(e)=>setNewsletter(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors bg-white rounded-none min-w-0 font-light font-futura-pt-light text-black"
                />
                <button className="px-6 py-3 bg-black text-white text-sm font-light hover:bg-gray-900 transition-colors duration-300 whitespace-nowrap flex-shrink-0 font-futura-pt-light" onClick={handleNewsSubscribe}>
                  Subscribe
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-light mb-4 text-black font-futura-pt-book">
                Follow Us
              </h3>
              <div className="flex items-center gap-5">
                <a
                  href="https://www.facebook.com/share/1AKEpX6kqd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-black hover:text-gray-600 transition-colors duration-300"
                >
                  <Facebook size={22} strokeWidth={1.5} />
                </a>
                <a
                  href="https://x.com/yobha_world"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (formerly Twitter)"
                  className="text-black hover:text-gray-600 transition-colors duration-300"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/yobha.world"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-black hover:text-gray-600 transition-colors duration-300"
                >
                  <Instagram size={22} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-text-light/20 bg-premium-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black font-light font-futura-pt-light">
            <p>©2026 Copyright @Yogya By Yogita Bhatia</p>
            <p>Customer Care: 07935429061</p>
            <div className="flex gap-8">
              <Link
                to="/privacy-policy"
                className="hover:text-gray-600 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-conditions"
                className="hover:text-gray-600 transition-colors duration-300"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/return-policy"
                className="hover:text-gray-600 transition-colors duration-300"
              >
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
