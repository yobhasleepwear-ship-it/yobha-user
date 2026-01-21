import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ShoppingBag,
  Save,
  MapPin,
  ArrowLeft,
  X,
  Bookmark,
} from "lucide-react";

import { getFilteredProducts, getProductDescription } from "../../service/productAPI";
import { getAddresses, addAddress } from "../../service/address";
import { message } from "../../comman/toster-message/ToastContainer";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../redux/cartSlice";
import * as localStorageService from "../../service/localStorageService";
import { LocalStorageKeys } from "../../constants/localStorageKeys";

const Personalization = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const savedCountry = localStorage.getItem('selectedCountry');
  const parsedCountry = JSON.parse(savedCountry);
  const [selectedCountry, setSelectedCountry] = useState(parsedCountry?.code || "IN");

  // Helper function to get hex color from color name or hex code
  const getColorHex = (color) => {
    if (!color) return '#CCCCCC';

    // Check if color is already a hex code
    const isHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    if (isHex) {
      // Normalize 3-digit hex to 6-digit for consistency
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }
      return color;
    }

    // Map common color names to hex codes
    const colorNameToHex = {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'pink': '#FFC0CB',
      'purple': '#800080',
      'orange': '#FFA500',
      'brown': '#A52A2A',
      'gray': '#808080',
      'grey': '#808080',
      'navy': '#000080',
      'beige': '#F5F5DC',
      'cream': '#FFFDD0',
      'tan': '#D2B48C',
      'maroon': '#800000',
      'burgundy': '#800020',
      'ivory': '#FFFFF0',
      'peach': '#FFE5B4',
      'coral': '#FF7F50',
      'rose': '#FF007F',
      'lavender': '#E6E6FA',
      'mint': '#98FB98',
      'teal': '#008080',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
      'bronze': '#CD7F32',
      'copper': '#B87333',
      'olive': '#808000',
      'lime': '#00FF00',
      'aqua': '#00FFFF',
      'turquoise': '#40E0D0',
      'indigo': '#4B0082',
      'violet': '#8A2BE2',
    };

    // Normalize color name (lowercase, trim)
    const normalizedColor = color.toLowerCase().trim();
    return colorNameToHex[normalizedColor] || '#CCCCCC';
  };

  // Helper function to check if color is light (needs stronger border)
  const isLightColor = (hex) => {
    if (!hex) return false;
    const normalizedHex = hex.toLowerCase();
    const lightColors = ['#ffffff', '#fff', '#fffff0', '#fffdd0', '#f5f5dc', '#ffe5b4', '#e6e6fa', '#98fb98'];
    return lightColors.includes(normalizedHex);
  };

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['product', 'sizeColor', 'personalize'];

  // Product selection
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  // Personalization options
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [monogram, setMonogram] = useState("");
  const MONOGRAM_CHAR_LIMIT = 8;
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Gifting delivery
  const [deliveryOption, setDeliveryOption] = useState("recipient"); // "recipient" or "me"
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
  });
  // Recipient address (for "Send directly to recipient")
  const [recipientAddress, setRecipientAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
  });

  // Loading states
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingPersonalization, setSavingPersonalization] = useState(false);
  
  // Saved personalizations
  const [savedPersonalizations, setSavedPersonalizations] = useState([]);
  const [showSavedPersonalizations, setShowSavedPersonalizations] = useState(false);

  // Size Guide
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState('inches');
  const [activeSizeTab, setActiveSizeTab] = useState('fitGroupA');

  // Auto-fill city and state from pincode
  useEffect(() => {
    const fetchCityState = async () => {
      if (newAddress.pincode?.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${newAddress.pincode}`);
          const data = await res.json();

          if (data[0].Status === "Success" && data[0].PostOffice?.length) {
            const firstPostOffice = data[0].PostOffice[0];
            const { District, State } = firstPostOffice;

            // Auto-fill only if user hasn't typed anything
            setNewAddress((prev) => ({
              ...prev,
              city: prev.city || District,
              state: prev.state || State,
            }));
          }
        } catch (err) {
          console.error("Error fetching city/state:", err);
        }
      }
    };

    fetchCityState();
  }, [newAddress.pincode]);

  // Auto-fill city and state from pincode for recipient address
  useEffect(() => {
    const fetchCityState = async () => {
      if (recipientAddress.pincode?.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${recipientAddress.pincode}`);
          const data = await res.json();

          if (data[0].Status === "Success" && data[0].PostOffice?.length) {
            const firstPostOffice = data[0].PostOffice[0];
            const { District, State } = firstPostOffice;

            // Auto-fill only if user hasn't typed anything
            setRecipientAddress((prev) => ({
              ...prev,
              city: prev.city || District,
              state: prev.state || State,
            }));
          }
        } catch (err) {
          console.error("Error fetching city/state:", err);
        }
      }
    };

    fetchCityState();
  }, [recipientAddress.pincode]);
  
// Size Guide Data
const sizeGuideDataFitGroupA = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
];

const sizeGuideDataFitGroupB = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
];

const sizeGuideDataFitGroupC = [
  { size: "S", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "M", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "L", bust: "41-43", waist: "33-35", hip: "43-45" },
  { size: "XL", bust: "44-46", waist: "36-38", hip: "46-48" },
];

const sizeGuideDataFitGroupD = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
];

const fitGroups = [
  { id: 'fitGroupA', label: 'Robes', title: 'Robes', data: sizeGuideDataFitGroupA },
  { id: 'fitGroupB', label: 'Women Sets', title: 'Women Sets', data: sizeGuideDataFitGroupB },
  { id: 'fitGroupC', label: 'Men Sets', title: 'Men Sets', data: sizeGuideDataFitGroupC },
  { id: 'fitGroupD', label: 'Tracksuits', title: 'Tracksuits', data: sizeGuideDataFitGroupD },
];

const sizeGuideData = sizeGuideDataFitGroupB;

// Helper functions for unit conversion
const inchesToCm = (inches) => (inches * 2.54).toFixed(1);
const cmToInches = (cm) => (cm / 2.54).toFixed(1);
const parseRange = (rangeStr) => {
  const parts = rangeStr.split('-').map(part => parseFloat(part.trim()));
  return parts.length === 2 ? parts : [parts[0], parts[0]];
};
const convertRange = (rangeStr, fromUnit, toUnit) => {
  const [min, max] = parseRange(rangeStr);
  if (fromUnit === toUnit) return rangeStr;
  if (fromUnit === 'inches' && toUnit === 'cm') {
    return `${inchesToCm(min)}-${inchesToCm(max)}`;
  } else if (fromUnit === 'cm' && toUnit === 'inches') {
    return `${cmToInches(min)}-${cmToInches(max)}`;
  }
  return rangeStr;
};

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const payload = {
        q: "",
        category: "personalization",
        subCategory: "",
        minPrice: null,
        maxPrice: null,
        pageNumber: 1,
        pageSize: 50,
        sort: "latest",
        country: null,
      };
      const response = await getFilteredProducts(payload);
      if (response?.success && response.data?.items) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      message.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch product details
  const fetchProductDetails = async (productId) => {
    try {
      const response = await getProductDescription(productId);
      setProductDetails(response.data);
      // Set default size and color
      if (response.data.sizeOfProduct?.length > 0) {
        setSelectedSize(response.data.sizeOfProduct[0]);
      }
      if (response.data.availableColors?.length > 0) {
        setSelectedColor(response.data.availableColors[0]);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      message.error("Failed to load product details");
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      const addresses = response.data || [];
      setUserAddresses(addresses);
      if (addresses.length > 0) {
        setSelectedAddress(addresses[0]);
      }
    } catch (err) {
      console.log("Failed to fetch addresses");
    }
  };

  useEffect(() => {
    fetchProducts();
    loadSavedPersonalizations();
  }, [fetchProducts]);

  // Load saved personalizations from localStorage
  const loadSavedPersonalizations = () => {
    try {
      const saved = localStorage.getItem("savedPersonalizations");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedPersonalizations(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load saved personalizations:", error);
      setSavedPersonalizations([]);
    }
  };

  useEffect(() => {
    if (deliveryOption === "me") {
      fetchAddresses();
    } else if (deliveryOption === "recipient") {
      // Reset recipient address when switching to recipient option
      setRecipientAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        landmark: '',
      });
    }
  }, [deliveryOption]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductDetails(selectedProduct.id);
    }
  }, [selectedProduct]);

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCurrentStep(1);
  };

  // Handle size/color selection complete
  const handleSizeColorComplete = () => {
    if (!selectedSize || !selectedColor) {
      message.error("Please select both size and color");
      return;
    }
    setCurrentStep(2);
  };

  // Handle add address
  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      message.error("Please fill all required fields");
      return;
    }

    setIsAddingAddress(true);
    try {
      const addressPayload = {
        fullName: newAddress.fullName,
        MobileNumnber: newAddress.phone,
        line1: newAddress.addressLine1,
        line2: newAddress.addressLine2 || '',
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.pincode,
        country: newAddress.country,
        landmark: newAddress.landmark || '',
        isDefault: false
      };

      const response = await addAddress(addressPayload);
      if (response.success) {
        message.success("Address added successfully");
        await fetchAddresses();
        setSelectedAddress(response.data);
        setUseSavedAddress(true);
        setNewAddress({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          landmark: '',
        });
      }
    } catch (error) {
      console.error("Failed to add address:", error);
      message.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Format price - Fixed to return object with symbol and number
  const formatPrice = (price, currency = "INR") => {
    if (price === null || price === undefined || price === "") {
      return { symbol: "", number: "0" };
    }
    const numericAmount = Number(price || 0);
    if (Number.isNaN(numericAmount)) {
      return { symbol: "", number: String(price || 0) };
    }
    const currencyCode = String(currency || "INR").toUpperCase();
    const currencySymbols = {
      INR: "₹",
      USD: "$",
      AED: "AED",
      SAR: "SAR",
      QAR: "QAR",
      KWD: "KWD",
      OMR: "OMR",
      BHD: "BHD",
      JOD: "JOD",
      LBP: "LBP",
      EGP: "EGP",
      IQD: "IQD",
    };
    const symbol = currencySymbols[currencyCode] || currencyCode;
    const formattedNumber = numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return { symbol, number: formattedNumber };
  };

  // Get matched price
  const getMatchedPrice = () => {
    if (!productDetails?.priceList) return null;
    return productDetails.priceList.find(
      (item) => item.country === selectedCountry && item.size === selectedSize
    );
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      message.error("Please select size and color");
      return;
    }

    if (deliveryOption === "recipient") {
      // Validate recipient address
      if (!recipientAddress.fullName || !recipientAddress.phone || !recipientAddress.addressLine1 || !recipientAddress.city || !recipientAddress.state || !recipientAddress.pincode) {
        message.error("Please fill all required recipient details");
        return;
      }
    } else if (deliveryOption === "me" && !selectedAddress) {
      message.error("Please select or add an address");
      return;
    }

    setAddingToCart(true);
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      
      const safeProduct = JSON.parse(
        JSON.stringify(productDetails, (key, value) => {
          if (typeof value === "function") return undefined;
          if (key.startsWith("__react")) return undefined;
          return value;
        })
      );

      // Check country restriction
      const existingCountry = cart.length > 0 ? cart[0].country : null;
      if (existingCountry && existingCountry !== selectedCountry) {
        message.error(`You can only add items from ${existingCountry}.`);
        setAddingToCart(false);
        return;
      }

      const itemIndex = cart.findIndex(
        (item) => item.id === safeProduct.id && item.size === selectedSize && item.color === selectedColor
      );

      // Ensure price is properly set - fix NaN issue
      const matchedPrice = getMatchedPrice();
      const itemPrice = matchedPrice?.priceAmount 
        ? Number(matchedPrice.priceAmount) 
        : (productDetails?.unitPrice ? Number(productDetails.unitPrice) : 0);
      const itemCurrency = matchedPrice?.currency || productDetails?.currency || "INR";
      
      // Calculate lineTotal to prevent NaN in checkout
      const lineTotal = itemPrice * quantity;

      const cartItem = {
        ...safeProduct,
        size: selectedSize,
        country: selectedCountry,
        quantity: quantity,
        monogram: monogram,
        color: selectedColor,
        note: notes,
        giftAddress: deliveryOption === "me" ? selectedAddress : (deliveryOption === "recipient" ? recipientAddress : null),
        deliveryOption: deliveryOption,
        // Ensure price fields are set correctly to prevent NaN
        unitPrice: itemPrice,
        price: itemPrice,
        currency: itemCurrency,
        priceList: productDetails?.priceList || [],
        lineTotal: lineTotal,
        // Add countryPrice for shipping calculation
        countryPrice: matchedPrice ? {
          priceAmount: itemPrice,
          currency: itemCurrency,
        } : null,
      };

      if (itemIndex !== -1) {
        cart[itemIndex] = cartItem;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      dispatch(setCartCount(cart.length));
      message.success(`${safeProduct.productName || "Product"} added to cart!`);
      navigate("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      message.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle save personalization
  const handleSavePersonalization = async () => {
    if (!selectedSize || !selectedColor) {
      message.error("Please select size and color");
      return;
    }

    if (deliveryOption === "recipient") {
      if (!recipientAddress.fullName || !recipientAddress.phone || !recipientAddress.addressLine1 || !recipientAddress.city || !recipientAddress.state || !recipientAddress.pincode) {
        message.error("Please fill all required recipient details");
        return;
      }
    } else if (deliveryOption === "me" && !selectedAddress) {
      message.error("Please select or add an address");
      return;
    }

    setSavingPersonalization(true);
    try {
      // Save personalization to localStorage
      const personalizationData = {
        id: Date.now().toString(),
        productId: productDetails?.id,
        productName: productDetails?.productName || productDetails?.name,
        productImage: productDetails?.images?.[0]?.url || productDetails?.images?.[0] || productDetails?.thumbnailUrl || '',
        size: selectedSize,
        color: selectedColor,
        monogram: monogram,
        notes: notes,
        deliveryOption: deliveryOption,
        address: deliveryOption === "me" ? selectedAddress : (deliveryOption === "recipient" ? recipientAddress : null),
        savedAt: new Date().toISOString(),
      };
      
      const existing = savedPersonalizations || [];
      const updated = [...existing, personalizationData];
      localStorage.setItem("savedPersonalizations", JSON.stringify(updated));
      setSavedPersonalizations(updated);
      message.success("Personalization saved successfully!");
    } catch (error) {
      console.error("Failed to save personalization:", error);
      message.error("Failed to save personalization");
    } finally {
      setSavingPersonalization(false);
    }
  };

  // Load a saved personalization
  const loadSavedPersonalization = async (saved) => {
    try {
      setSelectedProduct({ id: saved.productId });
      setMonogram(saved.monogram || "");
      setNotes(saved.notes || "");
      setDeliveryOption(saved.deliveryOption || "recipient");
      if (saved.deliveryOption === "me") {
        setSelectedAddress(saved.address);
        setUseSavedAddress(true);
      } else if (saved.deliveryOption === "recipient") {
        setRecipientAddress(saved.address || {
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          landmark: '',
        });
      }
      setShowSavedPersonalizations(false);
      // Fetch product details and set size/color
      await fetchProductDetails(saved.productId);
      setSelectedSize(saved.size);
      setSelectedColor(saved.color);
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to load saved personalization:", error);
      message.error("Failed to load saved personalization");
    }
  };

  // Delete saved personalization
  const deleteSavedPersonalization = (id) => {
    const updated = savedPersonalizations.filter(p => p.id !== id);
    localStorage.setItem("savedPersonalizations", JSON.stringify(updated));
    setSavedPersonalizations(updated);
    message.success("Personalization deleted");
  };

  // Render product selection
  const renderProductSelection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-light text-black font-futura-pt-book">
            Select a Product to Personalize
          </h2>
          {savedPersonalizations.length > 0 && (
            <button
              onClick={() => setShowSavedPersonalizations(!showSavedPersonalizations)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-black transition-colors font-light font-futura-pt-light rounded-full"
            >
              <Bookmark size={16} />
              Saved Personalizations ({savedPersonalizations.length})
            </button>
          )}
        </div>

        {/* Saved Personalizations Modal */}
        {showSavedPersonalizations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-light text-black font-futura-pt-book">
                  Saved Personalizations
                </h2>
                <button
                  onClick={() => setShowSavedPersonalizations(false)}
                  className="p-2 hover:bg-gray-100 transition-colors rounded-full"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {savedPersonalizations.length === 0 ? (
                  <p className="text-sm font-light text-gray-500 font-futura-pt-light text-center py-8">
                    No saved personalizations
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPersonalizations.map((saved) => {
                      // Handle image format
                      let savedImage = '';
                      if (saved.productImage) {
                        savedImage = typeof saved.productImage === 'string' 
                          ? saved.productImage 
                          : saved.productImage?.url || saved.productImage?.imageUrl || '';
                      }
                      return (
                        <div
                          key={saved.id}
                          className="border border-gray-200 p-4 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {savedImage ? (
                              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={savedImage}
                                  alt={saved.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-light font-futura-pt-light">No Image</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-sm font-light text-black font-futura-pt-book mb-2">
                                {saved.productName || "Product"}
                              </h3>
                              <p className="text-xs font-light text-gray-600 font-futura-pt-light">
                                Size: {saved.size} | Color: {saved.color}
                              </p>
                              {saved.monogram && (
                                <p className="text-xs font-light text-gray-600 font-futura-pt-light">
                                  Initials: {saved.monogram}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  onClick={() => loadSavedPersonalization(saved)}
                                  className="px-4 py-1.5 bg-black text-white text-xs font-light font-futura-pt-light hover:bg-gray-900 transition-colors rounded-full"
                                >
                                  Load
                                </button>
                                <button
                                  onClick={() => deleteSavedPersonalization(saved.id)}
                                  className="px-4 py-1.5 border border-gray-200 text-black text-xs font-light font-futura-pt-light hover:border-gray-400 transition-colors rounded-full"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              // Try multiple image paths - handle both object and string formats
              let productImage = '';
              if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                productImage = typeof product.images[0] === 'string' 
                  ? product.images[0] 
                  : product.images[0]?.url || product.images[0]?.imageUrl || '';
              }
              if (!productImage) {
                productImage = product.thumbnailUrl || product.image || product.imageUrl || '';
              }
              return (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="group relative aspect-square bg-gray-50 border border-gray-200 hover:border-black transition-all duration-300 overflow-hidden rounded-lg"
                >
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name || product.productName || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${productImage ? 'hidden' : 'flex'}`}>
                    <span className="text-gray-400 font-light font-futura-pt-light text-sm">No Image</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm rounded-b-lg">
                    <p className="text-sm font-light text-black font-futura-pt-light text-left">
                      {product.name || product.productName || "Product"}
                    </p>
                    {product.unitPrice && (
                      <p className="text-xs font-light text-black font-futura-pt-light text-left mt-1">
                        {formatPrice(product.unitPrice, product.currency).symbol}{formatPrice(product.unitPrice, product.currency).number}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render size and color selection
  const renderSizeColorSelection = () => {
    if (!productDetails) return null;

    // Handle both object and string image formats
    let productImage = '';
    if (productDetails.images && Array.isArray(productDetails.images) && productDetails.images.length > 0) {
      productImage = typeof productDetails.images[0] === 'string' 
        ? productDetails.images[0] 
        : productDetails.images[0]?.url || productDetails.images[0]?.imageUrl || '';
    }
    if (!productImage) {
      productImage = productDetails.thumbnailUrl || productDetails.image || productDetails.imageUrl || '';
    }

    return (
      <div className="space-y-8">
        <button
          onClick={() => setCurrentStep(0)}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-light font-futura-pt-light mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        
        <div className="flex items-center gap-4">
          {productImage ? (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={productImage}
                alt={productDetails.productName || productDetails.name || "Product"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-gray-100 items-center justify-center">
                <span className="text-gray-400 text-xs font-light font-futura-pt-light">No Image</span>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-light font-futura-pt-light">No Image</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-light text-black font-futura-pt-book">
              {productDetails.productName || productDetails.name || "Product"}
            </h2>
            <p className="text-sm font-light text-black font-futura-pt-light mt-1">
              Select size and color
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light text-black font-futura-pt-book">
                Size
              </h3>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-sm text-gray-600 font-light font-futura-pt-light underline hover:text-black transition-colors"
              >
                Size guide
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {productDetails.sizeOfProduct?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 px-4 border transition-all duration-300 font-light font-futura-pt-light rounded-lg ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 text-black hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-lg font-light text-black font-futura-pt-book mb-4">
              Color
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {productDetails.availableColors?.map((color) => {
                const displayHex = getColorHex(color);
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      selectedColor === color
                        ? 'border-black scale-110'
                        : isLightColor(displayHex) ? 'border-gray-400' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: displayHex }}
                    >
                      {selectedColor === color && (
                        <Check size={16} className={isLightColor(displayHex) ? "text-black" : "text-white"} />
                      )}
                    </div>
                    <span className={`text-xs font-light font-futura-pt-light ${
                      selectedColor === color ? 'text-black' : 'text-gray-600'
                    }`}>
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSizeColorComplete}
            disabled={!selectedSize || !selectedColor}
            className="px-8 py-3 bg-black text-white font-light font-futura-pt-light hover:bg-gray-900 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>

        {/* Size Guide Modal */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-4 z-[60] overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white p-4 sm:p-6 md:p-8 shadow-xl my-auto max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black/60 hover:text-black transition-colors text-xl sm:text-2xl leading-none z-10"
                onClick={() => setIsSizeGuideOpen(false)}
                aria-label="Close size guide"
              >
                ✕
              </button>

              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl text-black mb-4 sm:mb-6 font-light font-futura-pt-book pr-8">
                Size Guide
              </h3>

              {/* Unit Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base text-gray-600 font-light font-futura-pt-light whitespace-nowrap">Unit:</span>
                  <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setSizeGuideUnit('inches')}
                      className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-light font-futura-pt-light transition-all rounded-full ${
                        sizeGuideUnit === 'inches'
                          ? 'bg-black text-white'
                          : 'text-black/70 hover:text-black'
                      }`}
                    >
                      Inches
                    </button>
                    <button
                      onClick={() => setSizeGuideUnit('cm')}
                      className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-light font-futura-pt-light transition-all rounded-full ${
                        sizeGuideUnit === 'cm'
                          ? 'bg-black text-white'
                          : 'text-black/70 hover:text-black'
                      }`}
                    >
                      CM
                    </button>
                  </div>
                </div>
              </div>

              {/* Fit Group Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                {fitGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveSizeTab(group.id)}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-light font-futura-pt-light transition-all rounded-full border ${
                      activeSizeTab === group.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-black/70 hover:border-black/40 hover:bg-black/5'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {/* Size Chart Table */}
              <p className="text-sm sm:text-base font-light text-gray-600 mb-4">
                Discover your perfect fit. If you are in-between sizes, we recommend choosing the larger size.
              </p>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 sm:px-4 py-2 md:py-3 text-left text-xs sm:text-sm font-light font-futura-pt-light text-black">Size</th>
                        <th className="px-3 sm:px-4 py-2 md:py-3 text-left text-xs sm:text-sm font-light font-futura-pt-light text-black">
                          Bust ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </th>
                        <th className="px-3 sm:px-4 py-2 md:py-3 text-left text-xs sm:text-sm font-light font-futura-pt-light text-black">
                          Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </th>
                        <th className="px-3 sm:px-4 py-2 md:py-3 text-left text-xs sm:text-sm font-light font-futura-pt-light text-black">
                          Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fitGroups.find(g => g.id === activeSizeTab)?.data.map((row, idx) => (
                        <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 sm:px-4 py-2 md:py-3 text-xs sm:text-sm font-light font-futura-pt-light text-black">
                            {row.size}
                          </td>
                          <td className="px-3 sm:px-4 py-2 md:py-3 text-xs sm:text-sm font-light font-futura-pt-light text-black/80">
                            {convertRange(row.bust, 'inches', sizeGuideUnit)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 md:py-3 text-xs sm:text-sm font-light font-futura-pt-light text-black/80">
                            {convertRange(row.waist, 'inches', sizeGuideUnit)}
                          </td>
                          <td className="px-3 sm:px-4 py-2 md:py-3 text-xs sm:text-sm font-light font-futura-pt-light text-black/80">
                            {convertRange(row.hip, 'inches', sizeGuideUnit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render personalization interface
  const renderPersonalization = () => {
    if (!productDetails) return null;

    const matchedPrice = getMatchedPrice();
    const priceInfo = formatPrice(
      matchedPrice?.priceAmount || productDetails?.unitPrice || 0,
      matchedPrice?.currency || productDetails?.currency
    );
    // Handle both object and string image formats
    let productImage = '';
    if (productDetails.images && Array.isArray(productDetails.images) && productDetails.images.length > 0) {
      productImage = typeof productDetails.images[0] === 'string' 
        ? productDetails.images[0] 
        : productDetails.images[0]?.url || productDetails.images[0]?.imageUrl || '';
    }
    if (!productImage) {
      productImage = productDetails.thumbnailUrl || productDetails.image || productDetails.imageUrl || '';
    }

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-light font-futura-pt-light mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personalization Options */}
          <div className="space-y-8">
            {/* YOUR PERSONAL TOUCH */}
            <div>
              <h3 className="text-lg font-light text-black font-futura-pt-book mb-6">
                Your Personal Touch
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-light text-black font-futura-pt-light mb-2">
                    Name Initials
                  </label>
                  <input
                    type="text"
                    value={monogram}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, MONOGRAM_CHAR_LIMIT);
                      setMonogram(value);
                    }}
                    placeholder="Add initials—up to 8 characters"
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                    maxLength={MONOGRAM_CHAR_LIMIT}
                  />
                  <p className="text-xs font-light text-gray-500 font-futura-pt-light mt-2">
                    {monogram.length}/{MONOGRAM_CHAR_LIMIT} characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-light text-black font-futura-pt-light mb-2">
                    Message Card
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your heartfelt message here"
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black resize-none rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* GIFTING DELIVERY */}
            <div>
              <h3 className="text-lg font-light text-black font-futura-pt-book mb-6">
                Gifting Delivery
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    value="recipient"
                    checked={deliveryOption === "recipient"}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-light text-black font-futura-pt-light">
                      Send directly to recipient
                    </p>
                    <p className="text-xs font-light text-gray-500 font-futura-pt-light mt-1">
                      Enter recipient details
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    value="me"
                    checked={deliveryOption === "me"}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-light text-black font-futura-pt-light">
                      Deliver to me
                    </p>
                    <p className="text-xs font-light text-gray-500 font-futura-pt-light mt-1">
                      I will hand it personally
                    </p>
                  </div>
                </label>
              </div>

              {/* Address Fields for "Send directly to recipient" */}
              {deliveryOption === "recipient" && (
                <div className="mt-6 space-y-3 border border-gray-200 p-4 rounded-lg">
                  <h4 className="text-sm font-light text-black font-futura-pt-book mb-4">
                    Recipient Details
                  </h4>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={recipientAddress.fullName}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={recipientAddress.phone}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={recipientAddress.addressLine1}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, addressLine1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={recipientAddress.addressLine2}
                    onChange={(e) => setRecipientAddress({ ...recipientAddress, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={recipientAddress.city}
                      onChange={(e) => setRecipientAddress({ ...recipientAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={recipientAddress.state}
                      onChange={(e) => setRecipientAddress({ ...recipientAddress, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={recipientAddress.pincode}
                      onChange={(e) => setRecipientAddress({ ...recipientAddress, pincode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={recipientAddress.country}
                      onChange={(e) => setRecipientAddress({ ...recipientAddress, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Address Selection for "Deliver to me" */}
              {deliveryOption === "me" && (
                <div className="mt-6 space-y-4">
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setUseSavedAddress(true)}
                      className={`flex-1 py-2 px-4 border rounded-lg font-light font-futura-pt-light transition-colors ${
                        useSavedAddress
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-black hover:border-gray-400'
                      }`}
                    >
                      Choose from Saved
                    </button>
                    <button
                      onClick={() => setUseSavedAddress(false)}
                      className={`flex-1 py-2 px-4 border rounded-lg font-light font-futura-pt-light transition-colors ${
                        !useSavedAddress
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-black hover:border-gray-400'
                      }`}
                    >
                      Enter Manually
                    </button>
                  </div>

                  {useSavedAddress ? (
                    <div className="space-y-3">
                      {userAddresses.length > 0 ? (
                        userAddresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => setSelectedAddress(address)}
                            className={`w-full p-4 border text-left transition-all duration-300 rounded-lg ${
                              selectedAddress?.id === address.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full ${
                                selectedAddress?.id === address.id
                                  ? 'border-black bg-black'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAddress?.id === address.id && (
                                  <Check size={12} className="text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-light text-black font-futura-pt-book">
                                  {address.fullName}
                                </p>
                                <p className="text-xs font-light text-black font-futura-pt-light mt-1">
                                  {address.line1}, {address.line2}, {address.city}, {address.state} - {address.zip}
                                </p>
                                <p className="text-xs font-light text-black font-futura-pt-light">
                                  {address.country}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm font-light text-gray-500 font-futura-pt-light">
                          No saved addresses. Please add one manually.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 border border-gray-200 p-4 rounded-lg">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleAddAddress}
                        disabled={isAddingAddress}
                        className="w-full py-2 bg-black text-white font-light font-futura-pt-light hover:bg-gray-900 transition-colors rounded-lg disabled:opacity-50"
                      >
                        {isAddingAddress ? "Adding..." : "Add Address"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div>
            <h3 className="text-lg font-light text-black font-futura-pt-book mb-6">
              Live Preview
            </h3>
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
              {productImage ? (
                <div className="aspect-square mb-6 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={productImage}
                    alt={productDetails.productName || "Product"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                    <span className="text-gray-400 font-light font-futura-pt-light">No Image</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-square mb-6 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                  <span className="text-gray-400 font-light font-futura-pt-light">No Image</span>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-light text-black font-futura-pt-light">
                  <span>Personalisation:</span>
                  <span>{monogram || "—"}</span>
                </div>
                <div className="flex justify-between text-sm font-light text-black font-futura-pt-light">
                  <span>Message:</span>
                  <span className="text-right max-w-[60%]">{notes ? `"${notes.substring(0, 20)}${notes.length > 20 ? '...' : ''}"` : "—"}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-base font-light text-black font-futura-pt-book">
                    <span>Price:</span>
                    <span><span className="font-sans">{priceInfo.symbol}</span>{priceInfo.number}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-light font-futura-pt-light hover:bg-gray-900 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            {addingToCart ? "Adding..." : "Add Gift to Bag"}
          </button>
          <button
            onClick={handleSavePersonalization}
            disabled={savingPersonalization}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-black text-black font-light font-futura-pt-light hover:bg-gray-50 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {savingPersonalization ? "Saving..." : "Save Personalisation"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
        {currentStep === 0 && renderProductSelection()}
        {currentStep === 1 && renderSizeColorSelection()}
        {currentStep === 2 && renderPersonalization()}
      </div>
    </div>
  );
};

export default Personalization;
