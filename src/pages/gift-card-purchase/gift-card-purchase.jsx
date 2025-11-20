import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Gift, Mail, DollarSign, MapPin, ArrowRight, CheckCircle, Copy, Check } from "lucide-react";
import { message } from "../../comman/toster-message/ToastContainer";
import { createOrder, updatePayment } from "../../service/orderService";
import { CountrySelector, countryOptions } from "../../countryDropdown";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const GiftCardPurchase = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [giftCardCurrency, setGiftCardCurrency] = useState("");
  const [copied, setCopied] = useState(false);

  // Check for success parameters in URL (in case Razorpay redirects back)
  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const orderId = searchParams.get("razorpay_order_id");
    const giftCard = searchParams.get("giftCardCode");
    
    if (paymentId && orderId) {
      // Payment successful, check for gift card code in localStorage or fetch from API
      const storedGiftCard = localStorage.getItem("giftCardSuccess");
      if (storedGiftCard) {
        try {
          const giftCardData = JSON.parse(storedGiftCard);
          setGiftCardCode(giftCardData.code || "");
          setGiftCardAmount(giftCardData.amount || "");
          setGiftCardCurrency(giftCardData.currency || "");
          setShowSuccess(true);
          // Clean up URL
          navigate("/gift-card-purchase", { replace: true });
        } catch (error) {
          console.error("Error parsing gift card data:", error);
        }
      }
    } else if (giftCard) {
      // Gift card code passed in URL
      setGiftCardCode(giftCard);
      setShowSuccess(true);
      navigate("/gift-card-purchase", { replace: true });
    }
  }, [searchParams, navigate]);

  // Get currency based on country code
  const getCurrencyForCountry = (countryCode) => {
    // Countries that use INR
    const inrCountries = ["IN"];
    // Countries that use USD (or can use USD as default)
    const usdCountries = ["AE", "SA", "QA", "KW", "OM", "BH", "JO", "LB", "EG", "IQ"];
    
    if (inrCountries.includes(countryCode)) {
      return "INR";
    } else if (usdCountries.includes(countryCode)) {
      return "USD";
    }
    // Default to USD for other countries
    return "USD";
  };

  // Get saved country from localStorage
  useEffect(() => {
    const resolveSavedCountry = () => {
      if (typeof window === "undefined") return countryOptions[0];
      try {
        const saved = window.localStorage.getItem("selectedCountry");
        if (saved) {
          const parsed = JSON.parse(saved);
          const match = countryOptions.find((c) => c.code === parsed.code);
          if (match) {
            setCountry(match.code);
            setCurrency(getCurrencyForCountry(match.code));
            return match;
          }
        }
      } catch (error) {
        console.error("Unable to parse saved country", error);
      }
      return countryOptions[0];
    };
    
    const savedCountry = resolveSavedCountry();
    setCountry(savedCountry.code);
    setCurrency(getCurrencyForCountry(savedCountry.code));
  }, []);

  const handleCountryChange = (selectedCode) => {
    const newCurrency = getCurrencyForCountry(selectedCode);
    setCountry(selectedCode);
    setCurrency(newCurrency);
    // Reset amount when country/currency changes
    setAmount("");
  };

  const handleCopyCode = () => {
    if (giftCardCode) {
      navigator.clipboard.writeText(giftCardCode).then(() => {
        setCopied(true);
        message.success("Gift card code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }).catch((err) => {
        console.error("Failed to copy:", err);
        message.error("Failed to copy code");
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !amount) {
      message.error("Please fill all fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      message.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // Load Razorpay script
      await loadRazorpayScript();

      // Construct Gift Card payload
      const giftCardPurchase = {
        currency: currency,
        productRequests: [],
        shippingAddress: null,
        paymentMethod: "razorpay",
        giftCardAmount: parseFloat(amount),
        email: email,
        orderCountry: country,
      };

      // Create Order
      const orderRes = await createOrder(giftCardPurchase);

      if (!orderRes.success) {
        message.error("Order creation failed ❌");
        setLoading(false);
        return;
      }

      // If no Razorpay order, mark as success
      if (!orderRes.razorpayOrderId) {
        console.log("Order created without Razorpay:", orderRes);
        // Check if gift card code is in response (check multiple possible paths)
        const giftCardCode = orderRes?.data?.giftCardCode || 
                             orderRes?.data?.code ||
                             orderRes?.giftCardCode || 
                             orderRes?.code ||
                             orderRes?.data?.giftCard?.code ||
                             orderRes?.giftCard?.code ||
                             "";
        
        console.log("Extracted gift card code (non-Razorpay):", giftCardCode);
        
        if (giftCardCode) {
          setGiftCardCode(giftCardCode);
          setGiftCardAmount(amount);
          setGiftCardCurrency(currency);
          setShowSuccess(true);
          // Store in localStorage for persistence
          localStorage.setItem("giftCardSuccess", JSON.stringify({
            code: giftCardCode,
            amount: amount,
            currency: currency
          }));
          message.success("Gift Card Order Created Successfully 🎁", 10000);
        } else {
          message.success("Gift Card Order Created Successfully 🎁", 10000);
          message.info("Gift card code will be sent to your email. Please check your inbox.");
        }
        setEmail("");
        setAmount("");
        setLoading(false);
        return;
      }

      // Razorpay options
      const options = {
        key: "rzp_test_Rb7lQAPEkEa2Aw",
        amount: parseFloat(amount) * 100,
        currency: currency,
        order_id: orderRes.razorpayOrderId,
        prefill: { email: email },
        handler: async (response) => {
          try {
            const updateRes = await updatePayment({
              razorpayOrderId: orderRes.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              isSuccess: true,
            });

            // Log response for debugging
            console.log("Payment update response:", updateRes);
            
            // Check if gift card code is in the response (check multiple possible paths)
            const giftCardCode = updateRes?.data?.giftCardCode || 
                                 updateRes?.data?.code ||
                                 updateRes?.giftCardCode || 
                                 updateRes?.code ||
                                 updateRes?.data?.giftCard?.code ||
                                 updateRes?.giftCard?.code ||
                                 "";
            
            console.log("Extracted gift card code:", giftCardCode);
            
            if (giftCardCode) {
              setGiftCardCode(giftCardCode);
              setGiftCardAmount(amount);
              setGiftCardCurrency(currency);
              setShowSuccess(true);
              
              // Store in localStorage for persistence
              localStorage.setItem("giftCardSuccess", JSON.stringify({
                code: giftCardCode,
                amount: amount,
                currency: currency
              }));
              
              message.success("Payment successful ✅");
            } else {
              message.success("Payment successful ✅");
              // If no code in response, show message that it will be sent via email
              message.info("Gift card code will be sent to your email. Please check your inbox.");
            }
            
            // Reset form
            setEmail("");
            setAmount("");
          } catch (error) {
            console.error("Payment update error:", error);
            message.error("Payment successful but update failed");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("GiftCard order error:", error);
      message.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // Predefined amount options
  const amountOptions = currency === "INR" 
    ? [500, 1000, 2000, 5000, 10000]
    : [10, 25, 50, 100, 200];

  // Reset amount when currency changes
  useEffect(() => {
    setAmount("");
  }, [currency]);

  // Success View
  if (showSuccess && giftCardCode) {
    return (
      <div className="min-h-screen bg-white font-futura-pt-light">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white border border-gray-200 p-8 md:p-12 lg:p-16 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-black rounded-full flex items-center justify-center">
                  <CheckCircle size={48} className="text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Thank You Message */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-black uppercase tracking-widest mb-4 font-futura-pt-light">
                Thank You for Your Purchase!
              </h1>
              <p className="text-text-medium text-base md:text-lg font-light mb-8 font-futura-pt-light">
                Your gift card has been successfully purchased
              </p>

              {/* Gift Card Code Section */}
              <div className="bg-gray-50 border border-gray-200 p-6 md:p-8 mb-6">
                <p className="text-sm uppercase tracking-wider text-text-medium font-light mb-4 font-futura-pt-light">
                  Your Gift Card Code
                </p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <code className="text-2xl md:text-3xl font-mono font-light text-black tracking-widest font-futura-pt-light">
                    {giftCardCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all duration-200 font-light font-futura-pt-light text-sm uppercase tracking-wider ${
                      copied
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-black bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} strokeWidth={2} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} strokeWidth={1.5} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                {giftCardAmount && (
                  <p className="text-sm text-text-medium font-light font-futura-pt-light">
                    Amount: {giftCardCurrency === "INR" ? `₹${giftCardAmount}` : `$${giftCardAmount}`}
                  </p>
                )}
              </div>

              {/* Info Message */}
              <div className="bg-white border border-gray-200 p-6 mb-8 text-left">
                <p className="text-sm text-text-medium font-light mb-3 font-futura-pt-light">
                  <strong className="text-black font-light">Important:</strong>
                </p>
                <ul className="text-sm text-text-medium font-light space-y-2 font-futura-pt-light list-disc list-inside">
                  <li>This gift card code has been sent to the recipient's email address</li>
                  <li>You can use this code at checkout to apply the gift card balance</li>
                  <li>Keep this code safe and secure</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setGiftCardCode("");
                    setGiftCardAmount("");
                    setGiftCardCurrency("");
                    localStorage.removeItem("giftCardSuccess");
                  }}
                  className="px-8 py-3 border border-black bg-white text-black uppercase tracking-widest text-sm font-light hover:bg-black hover:text-white transition-all duration-200 font-futura-pt-light"
                >
                  Purchase Another
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="px-8 py-3 bg-black text-white uppercase tracking-widest text-sm font-light hover:bg-gray-900 transition-all duration-200 font-futura-pt-light"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Purchase Form View
  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      {/* Hero Section */}
      <section className="border-b border-gray-200 py-8 md:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center">
                <Gift size={32} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-black uppercase tracking-widest mb-4 font-futura-pt-light">
              Gift Card
            </h1>
            <p className="text-text-medium text-base md:text-lg font-light tracking-wide font-futura-pt-light">
              Share the gift of luxury with a YOBHA gift card
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Form */}
            <div className="w-full">
              <div className="bg-white border border-gray-200 p-8 md:p-10 lg:p-12">
                <h2 className="text-2xl md:text-3xl font-light text-black uppercase tracking-widest mb-8 font-futura-pt-light">
                  Purchase Gift Card
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block mb-2 text-sm uppercase tracking-wider text-black font-light font-futura-pt-light">
                      <Mail size={16} className="inline-block mr-2" strokeWidth={1.5} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter recipient email"
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
                    />
                  </div>

                  {/* Amount Options */}
                  <div>
                    <label className="block mb-3 text-sm uppercase tracking-wider text-black font-light font-futura-pt-light">
                      <DollarSign size={16} className="inline-block mr-2" strokeWidth={1.5} />
                      Gift Card Amount
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
                      {amountOptions.map((option) => (
                        <button
                          key={`${currency}-${option}`}
                          type="button"
                          onClick={() => setAmount(option.toString())}
                          className={`w-full py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-200 font-futura-pt-light text-center ${
                            amount === option.toString()
                              ? "border-black bg-black text-white"
                              : "border-gray-300 text-black hover:border-black"
                          }`}
                        >
                          {currency === "INR" ? `₹${option}` : `$${option}`}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter custom amount (${currency})`}
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block mb-2 text-sm uppercase tracking-wider text-black font-light font-futura-pt-light">
                      <MapPin size={16} className="inline-block mr-2" strokeWidth={1.5} />
                      Country
                    </label>
                    <CountrySelector
                      value={country}
                      onSelect={handleCountryChange}
                      placeholder="Select country"
                      buttonClassName="border border-gray-300 bg-white hover:border-black focus:border-black"
                      menuClassName="bg-white border border-gray-200"
                      optionClassName="hover:bg-gray-50"
                    />
                  </div>

                  {/* Currency Display */}
                  <div className="pt-2 pb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-medium font-light font-futura-pt-light">
                        Selected Currency:
                      </p>
                      <span className="text-sm text-black font-light font-futura-pt-light">
                        {currency} {currency === "INR" ? "(₹)" : "($)"}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 uppercase tracking-widest text-sm font-light transition-all duration-200 flex items-center justify-center gap-2 font-futura-pt-light mt-6 ${
                      loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-900"
                    }`}
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        Purchase Gift Card
                        <ArrowRight size={18} strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="w-full">
              <div className="space-y-8 lg:pl-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-light text-black uppercase tracking-widest mb-6 font-futura-pt-light">
                    Gift Card Details
                  </h3>
                  <ul className="space-y-4 text-text-medium font-light text-sm md:text-base leading-relaxed font-futura-pt-light">
                    <li className="flex items-start">
                      <span className="text-black mr-3 mt-1  flex-shrink-0">•</span>
                      <span className="font-futura-pt-light font-light">Gift card will be sent to the recipient's email address</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="font-futura-pt-light font-light">Gift card can be used on all YOBHA products</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="font-futura-pt-light font-light">Gift card never expires</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="font-futura-pt-light font-light">Secure payment via Razorpay</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="font-futura-pt-light font-light">Instant delivery via email</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl md:text-2xl font-light text-black uppercase tracking-widest mb-6 font-futura-pt-light">
                    How It Works
                  </h3>
                  <ol className="space-y-4 text-text-medium font-light text-sm md:text-base leading-relaxed font-futura-pt-light">
                    <li className="flex items-start">
                      <span className="text-black mr-3 font-light flex-shrink-0">1.</span>
                      <span className="font-futura-pt-light font-light">Enter recipient email and gift card amount</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 font-light flex-shrink-0">2.</span>
                      <span className="font-futura-pt-light font-light">Complete secure payment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 font-light flex-shrink-0">3.</span>
                      <span className="font-futura-pt-light font-light">Gift card code sent to recipient's email</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-3 font-light flex-shrink-0">4.</span>
                      <span className="font-futura-pt-light font-light">Recipient can use the code at checkout</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GiftCardPurchase;
