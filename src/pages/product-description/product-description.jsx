import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Star,
  Truck,
  Share2,
  X,
} from "lucide-react";
import { addToCart, getCartDetails, getProductDescription, submitReview, getFilteredProducts } from "../../service/productAPI";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../redux/cartSlice";
import { incrementWishlistCount } from "../../redux/wishlistSlice";
import { addToWishlist, getWishlist } from "../../service/wishlist";
import { getCachedWishlist, invalidateWishlistCache } from "../../service/wishlistCache";
import { message } from "../../comman/toster-message/ToastContainer";
import ProductCard from "../product/components/product-card";
import * as localStorageService from "../../service/localStorageService";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import SlidePanel from "./slider";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const getAvailableQuantity = (priceList, selectedCountry, selectedSize) => {
  if (!Array.isArray(priceList) || priceList.length === 0) return 0;

  const matchedItem = priceList.find(
    (item) =>
      item.country === selectedCountry &&
      item.size === selectedSize &&
      item.quantity > 0
  );

  return matchedItem ? matchedItem.quantity : 0;
};



const formatPrice = (price, currency) => {
  if (typeof price !== 'number' || price === 0) return { symbol: '0', number: '' };

  // Ensure currency is uppercase and valid
  const currencyCode = currency ? currency.toUpperCase() : 'INR';

  // Currency symbol mapping
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'OMR': 'OMR',
    'BHD': 'BHD',
    'JOD': 'JOD',
    'LBP': 'LBP',
    'EGP': 'EGP',
    'IQD': 'IQD',
    'GBP': '£',
    'RUB': '₽'
  };


  const symbol = currencySymbols[currencyCode] || currencyCode;

  // Format the number with commas
  const formattedNumber = price.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return { symbol, number: formattedNumber };
};

// Fit Group A: Robes (Men & Women)
const sizeGuideDataFitGroupA = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
];

// Fit Group B: Women Co-ord & Pajama Sets
const sizeGuideDataFitGroupB = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
];

// Fit Group C: Men Lounge/Pajama/Short Sets
const sizeGuideDataFitGroupC = [
  { size: "S", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "M", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "L", bust: "41-43", waist: "33-35", hip: "43-45" },
  { size: "XL", bust: "44-46", waist: "36-38", hip: "46-48" },
];

// Fit Group D: Tracksuits & Zip Sets (Men & Women)
const sizeGuideDataFitGroupD = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
];

// Default for backwards compatibility
const sizeGuideData = sizeGuideDataFitGroupB;

// Fit group configuration
const fitGroups = [
  { id: 'fitGroupA', label: 'Robes', title: 'Robes', data: sizeGuideDataFitGroupA },
  { id: 'fitGroupB', label: 'Women Sets', title: 'Women Sets', data: sizeGuideDataFitGroupB },
  { id: 'fitGroupC', label: 'Men Sets', title: 'Men Sets', data: sizeGuideDataFitGroupC },
  { id: 'fitGroupD', label: 'Tracksuits', title: 'Tracksuits', data: sizeGuideDataFitGroupD },
];

// Helper functions for unit conversion
const inchesToCm = (inches) => {
  return (inches * 2.54).toFixed(1);
};

const cmToInches = (cm) => {
  return (cm / 2.54).toFixed(1);
};

// Parse measurement range (e.g., "32-33" returns [32, 33])
const parseRange = (rangeStr) => {
  const parts = rangeStr.split('-').map(part => parseFloat(part.trim()));
  return parts.length === 2 ? parts : [parts[0], parts[0]];
};

// Convert measurement range to the specified unit
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

// Calculate recommended size based on user measurements
const calculateRecommendedSize = (measurements, unit) => {
  if (!measurements.bust || !measurements.waist || !measurements.hip) {
    return null;
  }

  let bust = parseFloat(measurements.bust);
  let waist = parseFloat(measurements.waist);
  let hip = parseFloat(measurements.hip);

  // Convert to inches for comparison (all size guide data is in inches)
  if (unit === 'cm') {
    bust = parseFloat(cmToInches(bust));
    waist = parseFloat(cmToInches(waist));
    hip = parseFloat(cmToInches(hip));
  }

  // Find the best matching size
  let bestMatch = null;
  let bestScore = Infinity;

  sizeGuideData.forEach((sizeData) => {
    const [bustMin, bustMax] = parseRange(sizeData.bust);
    const [waistMin, waistMax] = parseRange(sizeData.waist);
    const [hipMin, hipMax] = parseRange(sizeData.hip);

    // Check if measurements fall within the range
    const bustInRange = bust >= bustMin && bust <= bustMax;
    const waistInRange = waist >= waistMin && waist <= waistMax;
    const hipInRange = hip >= hipMin && hip <= hipMax;

    // Calculate score (lower is better)
    let score = 0;
    if (!bustInRange) {
      if (bust < bustMin) score += bustMin - bust;
      else score += bust - bustMax;
    }
    if (!waistInRange) {
      if (waist < waistMin) score += waistMin - waist;
      else score += waist - waistMax;
    }
    if (!hipInRange) {
      if (hip < hipMin) score += hipMin - hip;
      else score += hip - hipMax;
    }

    // If all measurements are in range, this is a perfect match
    if (bustInRange && waistInRange && hipInRange) {
      score = -1;
    }

    if (score < bestScore) {
      bestScore = score;
      bestMatch = sizeData.size;
    }
  });

  return bestMatch;
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const filterColour = location.state?.filterColour;
  console.log(filterColour, "filterColour")

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // UI State
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
    { code: "RU", label: "Russia" },
    { code: "GB", label: "United Kingdom (UK)" },
    { code: "US", label: "United States (USA)" },
  ];

  const savedCountry = localStorage.getItem('selectedCountry');
  const parsedCountry = savedCountry ? JSON.parse(savedCountry) : countryOptions[0];

  // const [selectedCountry] = useState(parsedCountry);
  const [cartItem, setCartItems] = useState([])
  const IMAGES_PER_COLOR = 4;
  const [colorIndex, setColorIndex] = useState(0);
  const [productImage, setProductImage] = useState([])
  const selectedImages = useMemo(() => {
    const safeColorIndex = colorIndex < 0 ? 0 : colorIndex;
    const start = safeColorIndex * IMAGES_PER_COLOR;
    const end = start + IMAGES_PER_COLOR;
    const imagesForColor = productImage.slice(start, end);
    return imagesForColor.length > 0 ? imagesForColor : productImage.slice(0, IMAGES_PER_COLOR);
  }, [colorIndex, productImage]);
  console.log(productImage, "productImage")
  const [selectedCountry, setSelectedCountry] = useState(parsedCountry?.code);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isImageFull, setIsImageFull] = useState(false);
  const [currentImageFull, setCurrentImageFull] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [expandedSections, setExpandedSections] = useState({
    keyFeatures: false,
    fabric: false,
    careInstructions: false
  });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideUnit, setSizeGuideUnit] = useState('inches'); // 'inches' or 'cm'
  const [showFindSize, setShowFindSize] = useState(false);
  const [activeSizeTab, setActiveSizeTab] = useState('fitGroupA'); // Track active fit group tab
  const [userMeasurements, setUserMeasurements] = useState({
    bust: '',
    waist: '',
    hip: ''
  });
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const sizeDropdownRef = React.useRef(null);
  const sizeModalRef = React.useRef(null);
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [activeSection, setActiveSection] = useState(
    //     {
    //       "DElIVERY AND RETURN ": "We offer shipping across India and internationally. Orders within India are typically delivered within 3–7 working days from dispatch.International deliveries usually take 7–14 working days, depending on the destination and customs clearance.While most orders arrive within the estimated timeframe occasional delays may occur due to courier operations, customs processes, or unforeseen circumstances. Returns and exchanges are accepted within 7 days of delivery, provided items are unused,unwashed, and returned in their original condition with all tags intact.Customized or personalized items are not eligible for return or exchange.Once a returned item is received and approved after quality inspection, refunds(if applicable) will be processed to the original mode of payment within 5–7 working days."
    // }
  ); // which section to show

  console.log(activeSection, "activeSection")
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setIsSizeDropdownOpen(false);
      }
    };

    if (isSizeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSizeDropdownOpen]);

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setItemAddedToCart(false);
    setIsSizeDropdownOpen(false);
    setIsSizeModalOpen(false);
  };

  // Handle mobile modal open
  const handleMobileSizeClick = () => {
    setIsSizeModalOpen(true);
  };

  // Handle desktop dropdown toggle
  const handleDesktopSizeClick = () => {
    setIsSizeDropdownOpen(!isSizeDropdownOpen);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isSizeModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSizeModalOpen]);

  // Prevent modal from closing when clicking inside modal content
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Button Loading States
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [itemAddedToCart, setItemAddedToCart] = useState(false);
  const [openSlider, setOpenSlider] = useState(false);
  // API State
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState(null);
  const [newProducts, setProducts] = useState([])
  const [monogram, setMonogram] = useState("")
  const MONOGRAM_CHAR_LIMIT = 12;
  const [notes, setNotes] = useState("");
  // Review Form State
  const [averageProdRating, setAverageProdRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const sections = {
    description: product?.description,
    // keyFeatures: product?.keyFeatures,
    // fabric: product?.fabricType,
    careInstructions: product?.careInstructions,
    deliveryAndReturn: "We offer shipping across India and internationally. Orders within India are typically delivered within 3–7 working days from dispatch.International deliveries usually take 7–14 working days, depending on the destination and customs clearance.While most orders arrive within the estimated timeframe occasional delays may occur due to courier operations, customs processes, or unforeseen circumstances. Returns and exchanges are accepted within 7 days of delivery, provided items are unused,unwashed, and returned in their original condition with all tags intact.Customized or personalized items are not eligible for return or exchange.Once a returned item is received and approved after quality inspection, refunds(if applicable) will be processed to the original mode of payment within 5–7 working days.",
    giftPackaging: "The item will be delivered in a signature YOBHA box,ideal for gifting.",
  };

  // Check if product subCategory is personalization
  const isPersonalizationProduct = product?.subCategory?.toLowerCase() === 'personalization';

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const fetchProductDetail = useCallback(async (productId) => {
    setIsLoading(true)
    try {
      const response = await getProductDescription(productId);
      setProduct(response.data);
      setProductImage(response.data.images)
      if (filterColour) {
        const matchedColorIndex = response.data.availableColors.indexOf(filterColour);
        setColorIndex(matchedColorIndex >= 0 ? matchedColorIndex : 0);
      }

      setAverageProdRating(() => {
        const reviews = response.data.reviews || [];
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, item) => sum + item.rating, 0);
        return (total / reviews.length).toFixed(1);
      });
      fetchProducts(response?.data?.productMainCategory)

    } catch (error) {
      console.error("Error fetching product:", error);
    }
    finally {
      setIsLoading(false)
    }
  }, []);
  useEffect(() => {
    if (filterColour)
      setSelectedColor(filterColour || '');
  }, [filterColour]);
  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId, fetchProductDetail]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [colorIndex, productImage]);

  // Check if product is in wishlist on mount
  useEffect(() => {
    let isMounted = true;
    const checkWishlist = async () => {
      try {
        const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
        if (token && product && product.productId) {
          // Use cached wishlist to prevent multiple API calls
          const response = await getCachedWishlist(getWishlist);
          if (isMounted && response && response.data) {
            const wishlistItems = response.data;
            // Check if current product is in wishlist
            const isInWishlist = wishlistItems.some(
              (item) => item.product?.productId === product.productId
            );
            setIsWishlisted(isInWishlist);
          }
        }
      } catch (error) {
        // Silently fail if user is not authenticated or wishlist check fails
        if (isMounted) {
          console.error("Error checking wishlist:", error);
        }
      }
    };
    if (product && product.productId) {
      checkWishlist();
    }

    return () => {
      isMounted = false;
    };
  }, [product?.productId, productId]); // Only depend on productId to prevent unnecessary re-renders

  useEffect(() => {
    if (product) {
      if (product.availableColors.length > 0 && !selectedColor) {
        setSelectedColor(product.availableColors[0]);
      }
      if (product.sizeOfProduct.length > 0 && !selectedSize) {
        setSelectedSize(product.sizeOfProduct[0]);
      }
    }
  }, [product, selectedColor, selectedSize]);

  // Handle carousel responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth >= 1024 ? 3 : 2);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);


  useEffect(() => {
    setCarouselIndex(0);
  }, [itemsPerView, newProducts.length]);

  // Calculate recommended size when measurements change
  useEffect(() => {
    if (userMeasurements.bust && userMeasurements.waist && userMeasurements.hip) {
      const recommended = calculateRecommendedSize(userMeasurements, sizeGuideUnit);
      setRecommendedSize(recommended);
    } else {
      setRecommendedSize(null);
    }
  }, [userMeasurements, sizeGuideUnit]);

  const fetchProducts = async (category) => {
    setIsLoading(true);
    try {
      const payload = {
        q: "",
        category: category,
        subCategory: "",
        minPrice: null,
        maxPrice: null,
        pageNumber: null,
        pageSize: 4,
        sort: "latest",
        country: null,
      };

      const response = await getFilteredProducts(payload);
      if (response && response.success && response.data) {
        setProducts(response.data.items || []);

      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewComment.trim()) {
      message.error("Please enter a review comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        rating: reviewRating,
        comment: reviewComment.trim()
      };

      await submitReview(productId, reviewData);
      message.success("Your opinion matters to us.");

      // Reset form
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);

      await fetchProductDetail(productId);

    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // const availableQuantity = product
  //   ? getAvailableQuantity(product.priceList, selectedCountry, selectedSize)
  //   : 0;
  const availableQuantity = 100000000000;

  const goToImage = (nextIndex) => {
    if (selectedImages.length === 0) return;
    const maxIndex = selectedImages.length - 1;
    const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
    setSelectedImageIndex(clampedIndex);
  };

  const handlePrevImage = () => {
    if (selectedImages.length === 0) return;
    const prevIndex = selectedImageIndex === 0 ? selectedImages.length - 1 : selectedImageIndex - 1;
    setSelectedImageIndex(prevIndex);
  };

  const handleNextImage = () => {
    if (selectedImages.length === 0) return;
    const nextIndex = selectedImageIndex === selectedImages.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImageIndex(nextIndex);
  };

  // Quantity controls
  const handleIncrement = () => {
    if (quantity < availableQuantity) {
      setQuantity(prev => prev + 1);
      setItemAddedToCart(false);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setItemAddedToCart(false);
    }
  };

  const fetchCart = async () => {

    try {
      const response = await getCartDetails()
      console.log(response.data.items.length);
      dispatch(setCartCount(response.data.items.length));
    }
    catch (err) {
      console.log(err || "something went wrong")
    }
    finally {

    }

  }
  // Add to cart
  // const handleAddToCart = async () => {
  //   if (!selectedColor || !selectedSize || availableQuantity === 0) {
  //     message.error('Please select color and size');
  //     return;
  //   }

  //   setAddingToCart(true);

  //   const payload = {
  //     productId: product.productId,
  //     size: selectedSize,
  //     quantity: quantity,
  //     currency: product?.priceList?.find(
  //       (item) => item.country === selectedCountry && item.size === selectedSize
  //     ).currency,
  //     note: ""
  //   };

  //   try {
  //     const response = await addToCart(payload);
  //     console.log("Added to cart:", response);
  //     console.log(response.data.success)
  //     if (response.data.success === 'true') {
  //       message.success("Product added to cart successfully!");
  //     }
  //     else {
  //       message.error(response.data.message)
  //     }
  //     setItemAddedToCart(true);
  //     fetchCart()
  //   } catch (err) {
  //     console.error("Error adding to cart:", err);
  //     message.error("Failed to add product to cart. Please try again.");
  //   } finally {
  //     setAddingToCart(false);
  //   }
  // };
  const handleAddToCart = (product, selectedSize, selectedCountry, quantity) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];


    const safeProduct = JSON.parse(
      JSON.stringify(product, (key, value) => {
        if (typeof value === "function") return undefined;
        if (key.startsWith("__react")) return undefined;
        return value;
      })
    );

    // 🛑 Restrict to one country
    const existingCountry = cart.length > 0 ? cart[0].country : null;
    if (existingCountry && existingCountry !== selectedCountry) {
      message.error(`You can only add items from ${existingCountry}.`);
      return;
    }


    const itemIndex = cart.findIndex(
      (item) => item.id === safeProduct.id && item.size === selectedSize && item.color === selectedColor
    );

    if (itemIndex !== -1) {

      cart[itemIndex] = {
        ...cart[itemIndex],
        quantity: quantity,
        note: notes,
        monogram: monogram,
      };
    } else {

      cart.push({
        ...safeProduct,
        size: selectedSize,
        country: selectedCountry,
        quantity: quantity,
        country: selectedCountry,
        monogram: monogram,
        color: selectedColor,
        note: notes
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart);
    dispatch(setCartCount(cart.length));
    message.success(`${safeProduct.name || "Product"} added to cart!`);
  };



  const handleGoToCart = () => {
    navigate("/cart");
  };


  const handleBuyNow = () => {
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);

    const selectedPrice =
      product.priceList.find(
        (p) =>
          p.size === selectedSize && p.country === selectedCountry
      ) || {};

    const lineTotal = (selectedPrice.priceAmount || product.unitPrice) * quantity;
    console.log(product.priceList, "pro")
    const checkoutProd = {
      items: [

        {
          ...product,
          currency: selectedPrice.currency,
          variantSize: selectedSize,
          variantColor: selectedColor,
          color: selectedColor,
          country: selectedCountry,
          size: selectedSize,
          thumbnailUrl: product.images[0].url,
          // countryPrice: {
          //   priceAmount: selectedPrice.priceAmount || product.unitPrice,
          //   currency: selectedPrice.currency || product.currency,
          // },
          quantity: quantity,

          lineTotal: lineTotal,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          note: notes,
          success: true,
          message: "OK",
          suggestedCountryPrice: null,
          monogram: monogram
        },


      ],
    };
    if (!token) {
      const currentPath = window.location.pathname + window.location.search;
      localStorageService.setValue("redirectAfterLogin", currentPath);

      message.info("Please log to Buy Now the product.");
      navigate("/login");
      return
    }
    navigate("/checkout/buynow", { state: { checkoutProd, selectedCountry, selectedSize, quantity } });
  };


  // Wishlist toggle
  const handleAddToWishlist = async (productId) => {
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);

    const selectedVariant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    const payload = {
      productId: product.productId,
      size: selectedVariant?.sku || '',
      desiredQuantity: quantity,
      desiredSize: selectedSize,
      desiredColor: selectedColor,
      notifyWhenBackInStock: true,
    };

    // If not authenticated, save pending action and redirect to login
    if (!token) {
      const pendingWishlistAction = {
        productId: productId,
        payload: payload,
        timestamp: Date.now()
      };

      localStorageService.setValue("pendingWishlistAction", JSON.stringify(pendingWishlistAction));

      // Save current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      localStorageService.setValue("redirectAfterLogin", currentPath);

      message.info("Please log in to add items to your wishlist.");
      navigate("/login");
      return;
    }

    setAddingToWishlist(true);

    try {
      const result = await addToWishlist(productId, payload);
      console.log("Added to wishlist:", result);
      // Invalidate cache so next check will fetch fresh data
      invalidateWishlistCache();
      setIsWishlisted(true);
      dispatch(incrementWishlistCount());
      message.success("Product added to wishlist!");
    } catch (err) {
      // If 401 error, save pending action and let interceptor handle redirect
      if (err?.response?.status === 401) {
        const pendingWishlistAction = {
          productId: productId,
          payload: payload,
          timestamp: Date.now()
        };

        localStorageService.setValue("pendingWishlistAction", JSON.stringify(pendingWishlistAction));
      }
      console.error("Failed to add to wishlist:", err);
      message.error("Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-text-medium text-xs uppercase tracking-widest font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div
        className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans"
      >
        <div className="text-center max-w-md px-6">
          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 uppercase font-futura-pt-light">
            Product Not Found
          </h2>
          <p className="text-gray-600 text-xs md:text-sm mb-8 font-light leading-relaxed font-futura-pt-light">
            {error || 'The product you are looking for does not exist or is no longer available.'}
          </p>
          <a
            href="/products"
            className="inline-block bg-black text-white px-6 py-2.5 font-light hover:bg-text-dark transition-colors uppercase tracking-widest text-xs"
          >
            Browse Products
          </a>
        </div>
      </div>
    );
  }
  const displayedReviews = showAll ? product.reviews : product.reviews.slice(0, 5);
  const hasMultipleImages = selectedImages.length > 1;
  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    // You can also trigger other logic here if needed
    console.log('Selected Country:', e.target.value);
  };
  const matchedPrice = product?.priceList?.find(
    (item) =>
      item.country === selectedCountry &&
      item.size === selectedSize
  );

  const shippingInfo = product.countryPrices.find(
    (item) => item.country === selectedCountry
  );
  const handleShare = async () => {
    const shareData = {
      title: product?.productName,
      text: `Check out this product: ${product?.productName}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share cancelled or failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Link copied to clipboard!");
    }
  };

  // Carousel navigation handlers
  const handleCarouselNext = () => {
    const maxIndex = Math.max(0, newProducts.length - itemsPerView);
    setCarouselIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handleCarouselPrev = () => {
    setCarouselIndex(prev => Math.max(prev - 1, 0));
  };

  // Handle size guide measurement input
  const handleMeasurementChange = (field, value) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setUserMeasurements(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // Reset measurements when switching units
  const handleUnitToggle = (newUnit) => {
    if (newUnit !== sizeGuideUnit) {
      // Convert existing measurements
      const converted = { ...userMeasurements };
      Object.keys(converted).forEach(key => {
        if (converted[key]) {
          const value = parseFloat(converted[key]);
          if (newUnit === 'cm') {
            converted[key] = inchesToCm(value);
          } else {
            converted[key] = cmToInches(value);
          }
        }
      });
      setUserMeasurements(converted);
      setSizeGuideUnit(newUnit);
    }
  };

  // Reset when size guide modal closes
  const handleCloseSizeGuide = () => {
    setIsSizeGuideOpen(false);
    setShowFindSize(false);
    setUserMeasurements({ bust: '', waist: '', hip: '' });
    setRecommendedSize(null);
  };

  return (
    <div
      className="min-h-screen bg-white font-futura-pt-light"
    >
      <div className="max-w-[1600px] mx-auto px-0">

        {/* Main Content Grid - Louis Vuitton Style */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-0">

          {/* Left Column - Full Product Image */}
          <div className="relative bg-white h-[500px] sm:h-[550px] lg:h-[600px] xl:h-[650px] group">
            {/* Mobile: Single-image horizontal slider with arrows */}
            <div className="relative w-full h-full lg:hidden">
              <div className="w-full h-full overflow-hidden">
                <div
                  className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                >
                  {selectedImages.map((image, index) => {
                    const imageSrc = typeof image === "string"
                      ? image
                      : (image?.url || image?.thumbnailUrl || "");
                    const imageAlt = typeof image === "string"
                      ? `Product image ${index + 1}`
                      : (image?.alt || `Product image ${index + 1}`);

                    return (
                      <img
                        key={index}
                        src={imageSrc}
                        alt={imageAlt}
                        className="w-full h-full object-contain cursor-pointer flex-shrink-0"
                        loading={index === selectedImageIndex ? "eager" : "lazy"}
                        onClick={() => {
                          setIsImageFull(true);
                          setCurrentImageFull(imageSrc);
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-gray-300 rounded-full flex items-center justify-center shadow-sm z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 border border-gray-300 rounded-full flex items-center justify-center shadow-sm z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>
                </>
              )}

              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-2 z-20">
                  {selectedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === selectedImageIndex
                        ? 'bg-black'
                        : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Vertical thumbnails on left + single main image on right */}
            <div className="hidden lg:flex h-full w-full items-start gap-4 px-4">
              <div className="w-20 h-full overflow-y-auto scrollbar-hide py-4 flex flex-col gap-3">
                {selectedImages.map((image, index) => {
                  const thumbSrc = typeof image === "string"
                    ? image
                    : (image?.thumbnailUrl || image?.url || "");
                  const thumbAlt = typeof image === "string"
                    ? `Thumbnail ${index + 1}`
                    : (image?.alt || `Thumbnail ${index + 1}`);

                  return (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-full h-24 border transition-all overflow-hidden ${index === selectedImageIndex
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                        }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img
                        src={thumbSrc}
                        alt={thumbAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="relative flex-1 h-full flex items-center justify-center py-4">
                <div className="w-full h-full overflow-hidden">
                  <div
                    className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                  >
                    {selectedImages.map((image, index) => {
                      const imageSrc = typeof image === "string"
                        ? image
                        : (image?.url || image?.thumbnailUrl || "");
                      const imageAlt = typeof image === "string"
                        ? `Product image ${index + 1}`
                        : (image?.alt || `Product image ${index + 1}`);

                      return (
                        <img
                          key={index}
                          src={imageSrc}
                          alt={imageAlt}
                          className="w-full h-full object-contain cursor-pointer flex-shrink-0"
                          loading={index === selectedImageIndex ? "eager" : "lazy"}
                          onClick={() => {
                            setIsImageFull(true);
                            setCurrentImageFull(imageSrc);
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Share Button - Top Right */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-10 h-10 bg-white hover:bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300 z-20"
            >
              <Share2 className="w-4 h-4 text-black" strokeWidth={1.5} />
            </button>
          </div>

          {/* Right Column - Product Info - Louis Vuitton Style */}

          <div className="bg-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:sticky lg:top-0 lg:self-start">

            {/* Product Header - Code and Name with Heart */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">

                <h3 className="text-xl sm:text-sm md:text-md lg:text-xl text-black  font-light font-futura-pt-book">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 font-light font-futura-pt-light mb-1">
                  {product.keyFeatures[1] || ''}
                </p>
              </div>

              {/* Heart Icon - Wishlist */}
            { product.isActive && <button
                onClick={() => handleAddToWishlist(product.id)}
                disabled={addingToWishlist}
                className="p-2 hover:opacity-70 transition-opacity disabled:opacity-50 flex-shrink-0"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {addingToWishlist ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                    className={isWishlisted ? "text-black fill-black" : "text-black"}
                  />
                )}
              </button>}
            </div>
            <div className="">
              {
                product.fabricType.map((item, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-500 font-light font-futura-pt-light"
                  >
                    {item}
                  </div>
                ))
              }
            </div>

            {/* Price - Louis Vuitton Style */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex flex-col">
                {(() => {
                  const matchedPrice = product.priceList?.find(
                    (item) =>
                      item.country === selectedCountry &&
                      item.size === selectedSize
                  );

                  if (!matchedPrice) {
                    return <span className="text-sm text-gray-500 font-light font-futura-pt-light">Price not available</span>;
                  }

                  const priceFormatted = formatPrice(matchedPrice.priceAmount, matchedPrice.currency);
                  return (
                    <>
                      <span className="text-lg md:text-md sm:text-sm font-light text-black font-futura-pt-light">
                        <span className="font-sans">{priceFormatted.symbol}</span>
                        {priceFormatted.number}
                      </span>
                      <p className="text-xs text-gray-500 font-light font-futura-pt-light mt-1">
                        (M.R.P. incl. of all taxes)
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
            {/* Color Selection */}
            {product?.availableColors?.length > 0 && (
              <div className="bg-white border border-text-light/10 p-3 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md lg:text-md md:text-md sm:text-sm text-black font-light font-futura-pt-book">
                    Color
                  </h3>
                  <span className="text-md lg:text-md md:text-md sm:text-sm font-light font-futura-pt-light">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-hide px-1 -mx-1">
                  {product?.availableColors.map((color, index) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setItemAddedToCart(false);
                        setColorIndex(index);
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 border transition-all duration-300 text-md lg:text-md md:text-md sm:text-sm font-light rounded-full relative group min-h-[28px] flex items-center justify-center ${selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-text-light/20 text-black hover:border-black/40 hover:bg-black/5'
                        }`}
                    >
                      {selectedColor === color && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection - Custom Dropdown (Desktop) / Modal (Mobile) */}
            {product.sizeOfProduct.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-book">
                    Select your size
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-md lg:text-md md:text-md sm:text-sm text-gray-600 font-light font-futura-pt-light underline hover:text-black transition-colors"
                  >
                    Size guide
                  </button>
                </div>

                {/* Desktop: Custom Dropdown */}
                <div className="relative hidden lg:block" ref={sizeDropdownRef}>
                  <button
                    type="button"
                    onClick={handleDesktopSizeClick}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-left text-black font-light font-futura-pt-light text-sm cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black flex items-center justify-between"
                  >
                    <span className={selectedSize ? 'text-black' : 'text-gray-400'}>
                      {selectedSize || 'Please select your size'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-black transition-transform duration-200 ${isSizeDropdownOpen ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {/* Custom Dropdown Menu */}
                  {isSizeDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                      {product.sizeOfProduct.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeSelect(size)}
                          className={`w-full px-4 py-3 text-left text-sm font-light font-futura-pt-light transition-colors ${selectedSize === size
                            ? 'bg-black text-white hover:bg-black'
                            : 'text-black hover:bg-gray-50'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile: Button to Open Modal */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={handleMobileSizeClick}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-left text-black font-light font-futura-pt-light text-sm cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black flex items-center justify-between"
                  >
                    <span className={selectedSize ? 'text-black' : 'text-gray-400'}>
                      {selectedSize || 'Please select your size'}
                    </span>
                    <ChevronDown size={18} className="text-black" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile: Bottom Sheet Modal for Size Selection */}
            {isSizeModalOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                  onClick={() => setIsSizeModalOpen(false)}
                />

                {/* Modal Content */}
                <div
                  ref={sizeModalRef}
                  onClick={handleModalContentClick}
                  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden slide-up-from-bottom"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">
                      Select your size
                    </h3>
                    <button
                      onClick={() => setIsSizeModalOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <X size={20} className="text-black" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Size Options */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {product.sizeOfProduct.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        className={`w-full px-6 py-4 text-left text-sm font-light font-futura-pt-light transition-colors border-b border-gray-100 ${selectedSize === size
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-50'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Size Guide Link */}
                  <div className="px-6 py-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSizeModalOpen(false);
                        setIsSizeGuideOpen(true);
                      }}
                      className="text-xs text-gray-600 font-light font-futura-pt-light underline hover:text-black transition-colors w-full text-left"
                    >
                      Size guide
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Monogram Input */}
            {isPersonalizationProduct && (
              <div className="space-y-2">
                <label className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-book">
                  Name Initials
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={monogram}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (value.length <= MONOGRAM_CHAR_LIMIT) {
                        setMonogram(value);
                        setItemAddedToCart(false);
                      }
                    }}
                    placeholder="Enter up to 12 characters"
                    maxLength={MONOGRAM_CHAR_LIMIT}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-black font-light font-futura-pt-light text-md lg:text-md md:text-md sm:text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-light">
                    {monogram.length}/{MONOGRAM_CHAR_LIMIT}
                  </div>
                </div>
                {monogram && (
                  <p className="text-md lg:text-md md:text-md sm:text-sm text-gray-500 font-light  font-futura-pt-light">
                    Your monogram will be displayed on the product
                  </p>
                )}
              </div>
            )}

            {/* Notes Input */}
            {isPersonalizationProduct && (
              <div className="space-y-2">
                <label className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-book">
                  Notes
                </label>
                <textarea
                  type="text"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setItemAddedToCart(false);
                  }}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-black font-light font-futura-pt-light text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 resize-none"
                />
              </div>
            )}

            {/* Action Buttons - Add to Cart & Buy Now */}
           { product.isActive ? <div className="flex flex-col gap-3">
              {/* Add to Cart Button */}
              <button
                onClick={itemAddedToCart ? handleGoToCart : () => handleAddToCart(product, selectedSize, selectedCountry, quantity)}
                disabled={
                  !selectedColor ||
                  !selectedSize ||
                  !matchedPrice ||
                  addingToCart
                }
                className="w-full bg-black text-white py-4 px-6 font-light hover:bg-gray-900 transition-colors text-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-futura-pt-light rounded-full"
              >
                {addingToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding to Cart...
                  </span>
                ) : (
                  itemAddedToCart ? 'Go to Cart' : 'Add to Cart'
                )}
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={
                  !selectedColor ||
                  !selectedSize ||
                  !matchedPrice ||
                  addingToCart
                }
                className="w-full bg-black text-white py-4 px-6 font-light hover:bg-gray-900 transition-colors text-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-futura-pt-light rounded-full"
              >
                {addingToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Buy Now'
                )}
              </button>
            </div> : <div><button  className="w-full bg-black text-white py-4 px-6 font-light hover:bg-gray-900 transition-colors text-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-futura-pt-light rounded-full">Out Of Stock</button></div>}



            {/* Shipping Info */}
            {shippingInfo && (
              <div className="flex items-start gap-2.5">
                <Truck size={16} className="text-text-medium mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">Shipping Charges</p>
                  <p className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-lightfont-futura-pt-light">
                    {shippingInfo.priceAmount === 0
                      ? "Free Shipment"
                      : `${shippingInfo.priceAmount.toLocaleString()} ${shippingInfo.currency}`}
                  </p>
                </div>
              </div>
            )}
            {/* <div className="space-y-3 pt-6 border-t border-text-light/20">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-text-medium mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-light text-black">Free Shipping</p>
                  <p className="text-xs text-text-medium">Estimated delivery: 3-5 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw size={20} className="text-text-medium mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-light text-black">Easy Returns</p>
                  <p className="text-xs text-text-medium">7-day return policy</p>
                </div>
              </div>
            </div> */}

            {/* Description - Louis Vuitton Style */}
            {/* {product.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-black text-sm leading-relaxed font-light font-futura-pt-light">
                  {product.description}
                </p>
              </div>
            )} */}

            {/* Product Details */}
            {(product.keyFeatures.length > 0 || Object.keys(product.specifications).length > 0 || product.fabricType.length > 0) && (
              // <div className="space-y-5 pt-5 border-t border-text-light/10">

              //   {product.description && (
              //     <div>
              //       <button
              //         onClick={() =>
              //           setExpandedSections(prev => ({
              //             ...prev,
              //             description: !prev.description
              //           }))
              //         }
              //         className="flex items-center justify-between w-full text-left mb-2.5"
              //       >
              //         <h3 className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">
              //           Description
              //         </h3>

              //         {expandedSections.description ? (
              //           <Minus size={14} className="text-black" strokeWidth={2} />
              //         ) : (
              //           <Plus size={14} className="text-black" strokeWidth={2} />
              //         )}
              //       </button>

              //       {expandedSections.description && (
              //         <p className="text-xs text-black leading-relaxed font-light font-futura-pt-light">
              //           {product.description}
              //         </p>
              //       )}
              //     </div>
              //   )}

              //   {/* Key Features */}
              //   {product.keyFeatures.length > 0 && (
              //     <div>
              //       <button
              //         onClick={() => setExpandedSections(prev => ({ ...prev, keyFeatures: !prev.keyFeatures }))}
              //         className="flex items-center justify-between w-full text-left mb-2.5"
              //       >
              //         <h3 className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">
              //           Key Features
              //         </h3>
              //         {expandedSections.keyFeatures ? (
              //           <Minus size={14} className="text-black" strokeWidth={2} />
              //         ) : (
              //           <Plus size={14} className="text-black" strokeWidth={2} />
              //         )}
              //       </button>
              //       {expandedSections.keyFeatures && (
              //         <ul className="space-y-1.5 list-disc pl-4">
              //           {product.keyFeatures.map((feature, index) => (
              //             <li
              //               key={index}
              //               className="text-xs text-black font-light leading-relaxed font-futura-pt-thin"
              //             >
              //               {feature}
              //             </li>
              //           ))}
              //         </ul>
              //       )}

              //     </div>
              //   )}

              //   {/* Fabric Type */}
              //   {product.fabricType.length > 0 && (
              //     <div>
              //       <button
              //         onClick={() => setExpandedSections(prev => ({ ...prev, fabric: !prev.fabric }))}
              //         className="flex items-center justify-between w-full text-left mb-2.5"
              //       >
              //         <h3 className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">
              //           Fabric
              //         </h3>
              //         {expandedSections.fabric ? (
              //           <Minus size={14} className="text-black" strokeWidth={2} />
              //         ) : (
              //           <Plus size={14} className="text-black" strokeWidth={2} />
              //         )}
              //       </button>
              //       {expandedSections.fabric && (
              //         <ul className="list-disc pl-4">
              //           <li className="text-xs text-black font-light leading-relaxed font-futura-pt-thin">
              //             {product.fabricType.join(', ')}
              //           </li>
              //         </ul>
              //       )}

              //     </div>
              //   )}


              //   {/* Care Instructions */}
              //   {product.careInstructions.length > 0 && (
              //     <div>
              //       <button
              //         onClick={() => setExpandedSections(prev => ({ ...prev, careInstructions: !prev.careInstructions }))}
              //         className="flex items-center justify-between w-full text-left mb-2.5"
              //       >
              //         <h3 className="text-md lg:text-md md:text-md sm:text-sm font-light text-black font-futura-pt-light">
              //           Care Instructions
              //         </h3>
              //         {expandedSections.careInstructions ? (
              //           <Minus size={14} className="text-black" strokeWidth={2} />
              //         ) : (
              //           <Plus size={14} className="text-black" strokeWidth={2} />
              //         )}
              //       </button>
              //       {expandedSections.careInstructions && (
              //         <ul className="space-y-1.5 list-disc pl-4">
              //           {product.careInstructions.map((instruction, index) => (
              //             <li
              //               key={index}
              //               className="text-xs text-text-medium font-light leading-relaxed font-futura-pt-thin"
              //             >
              //               {instruction}
              //             </li>
              //           ))}
              //         </ul>
              //       )}

              //     </div>
              //   )}
              // </div>
              <div className="pt-5 border-t border-text-light/10">
                {Object.keys(sections).map((section, index, arr) => {
                  const content = sections[section];
                  if (!content || (Array.isArray(content) && content.length === 0)) return null;

                  const sectionName =
                    section === "fabric"
                      ? "Fabric"
                      : section === "careInstructions"
                        ? "Care Instructions"
                        : section.charAt(0).toUpperCase() + section.slice(1);

                  const isLast = index === arr.length - 1;
                  console.log(sectionName, "sectionName")
                  return (
                    <button
                      key={section}
                      onClick={() => {
                        setActiveSection(section);
                        setOpenSlider(true);
                      }}
                      className={`flex items-center justify-between w-full text-left py-3 ${!isLast ? "border-b border-text-light/20" : ""
                        }`}
                    >
                      <h3 className="text-md font-light text-black font-futura-pt-light">
                        {sectionName === "Description" ? "PRODUCT DETAILS" : sectionName === "Care Instructions" ? "MATERIAL AND CARE" : sectionName === "DeliveryAndReturn" ? "DELIVERY & RETURNS" : sectionName === "GiftPackaging" ? "GIFT PACKAGING" : sectionName}
                      </h3>
                      {isDesktop ? (
                        <FiChevronRight className="text-black" size={16} />
                      ) : (
                        <FiChevronDown className="text-black" size={16} />
                      )}
                    </button>
                  );
                })}
              </div>


            )}
          </div>


        </div>
        {/* Review Form Section */}
        {false && <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-text-light/10">
          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
            Customer Reviews
          </h2>

          {/* Add Review Button */}
          {!showReviewForm && (
            <div className="mb-5 md:mb-6">
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full sm:w-auto bg-black hover:bg-text-dark text-white font-light py-2.5 px-6 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest hover:opacity-90 text-xs"
              >
                <Star size={12} />
                Write a Review
              </button>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6 md:mb-8 p-5 bg-premium-beige border border-text-light/10">
              <h3 className="text-sm md:text-base font-light text-black mb-4 uppercase tracking-widest">
                Share Your Experience
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <label className="block text-xs font-light text-text-medium mb-2 uppercase tracking-widest">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="p-1 transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Star
                          size={16}
                          className={`${rating <= reviewRating
                            ? "fill-black text-black"
                            : "fill-none text-text-light"
                            }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-text-medium font-light">
                      {reviewRating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Comment Input */}
                <div>
                  <label className="block text-xs font-light text-text-medium mb-2 uppercase tracking-widest">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                    className="w-full px-3 py-2.5 border border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-light resize-none text-xs"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full sm:w-auto bg-black hover:bg-text-dark text-white font-light py-2.5 px-6 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewComment('');
                      setReviewRating(5);
                    }}
                    className="w-full sm:w-auto bg-text-light/10 hover:bg-text-light/20 text-black font-light py-2.5 px-6 transition-all duration-200 uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>}

        {/* Existing Reviews Section - Commented out */}
        {/* {product.reviews.length > 0 && (
          <div className="mt-6 md:mt-8">
            <h3 className="text-sm md:text-base font-light text-black uppercase tracking-widest mb-5 md:mb-6">
              Customer Reviews ({product.reviews.length})
            </h3>
            <div className="space-y-4 md:space-y-5">
              {displayedReviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="border-b border-text-light/10 pb-4 last:border-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 mb-2.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={`${i < review.rating
                            ? "fill-black text-black"
                            : "fill-none text-text-light"
                            }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-medium font-light">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-dark leading-relaxed font-light">
                    {review.comment}
                  </p>
                </div>
              ))}

              {product.reviews.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-text-medium mt-2 hover:text-black transition-colors font-light uppercase tracking-widest"
                >
                  {showAll ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        )} */}
        {newProducts?.length > 0 && (
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12 border-t border-gray-200">
            {/* Section Header */}
            <div className="mb-8 md:mb-10">
              <h2 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black  mb-4 font-futura-pt-book">
                Hot Picks for You
              </h2>
              <div className="w-12 md:w-16 h-px bg-gray-300 mb-4 md:mb-5" />
              <p className="text-gray-900 text-md sm:text:sm md:text-md lg:text-md font-light leading-relaxed font-futura-pt-light">
                Discover more from our curated collection
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex items-stretch transition-transform duration-300 ease-in-out gap-3 sm:gap-4 md:gap-5 lg:gap-6"
                  style={{
                    transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)`
                  }}
                >
                  {newProducts.map((product) => {
                    // Extract price using the same logic as ProductCard
                    const savedCountry = localStorage.getItem('selectedCountry');
                    const parsedCountry = savedCountry ? JSON.parse(savedCountry) : null;
                    const selectedCountry = parsedCountry?.code || "IN";

                    let productPrice = 0;
                    let currency = "INR";

                    if (product?.priceList && Array.isArray(product.priceList) && product.priceList.length > 0) {
                      const firstSize = product?.availableSizes?.[0];
                      let matchedPrice = product.priceList.find(
                        (e) => e.country === selectedCountry && e.size === firstSize
                      );

                      if (!matchedPrice) {
                        matchedPrice = product.priceList.find(
                          (e) => e.country === selectedCountry
                        );
                      }

                      if (!matchedPrice) {
                        matchedPrice = product.priceList[0];
                      }

                      productPrice = matchedPrice?.priceAmount || 0;
                      currency = matchedPrice?.currency || "INR";
                    }

                    if (productPrice === 0 && product?.price && product.price > 0) {
                      productPrice = product.price;
                      currency = product?.priceList?.[0]?.currency || "INR";
                    }

                    const productImages = Array.isArray(product?.images) && product.images.length > 0
                      ? product.images
                      : [];

                    const formatPrice = (price, curr = 'INR') => {
                      if (typeof price !== 'number' || price === 0) return '';
                      const symbol = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr;
                      return `${symbol}${price.toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}`;
                    };

                    return (
                      <div
                        key={product.id}
                        className="flex-shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1.33rem)] group border border-gray-200 overflow-hidden bg-white hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
                        onClick={() => {
                          try {
                            const existing = JSON.parse(localStorage.getItem("recentVisited")) || [];
                            const filtered = existing.filter((p) => p.id !== product.id);
                            const updated = [product, ...filtered];
                            const limited = updated.slice(0, 8);
                            localStorage.setItem("recentVisited", JSON.stringify(limited));
                          } catch (err) {
                            console.error("Error saving recent visited products:", err);
                          }
                          navigate(`/productDetail/${product?.id}`);
                        }}
                      >
                        {/* Image Section */}
                        <div className="aspect-square overflow-hidden bg-gray-50 flex-shrink-0 relative">
                          <img
                            src={productImages[0] || product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                            alt={product.name || product.title || 'Product'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                            }}
                          />
                        </div>

                        {/* Info Section */}
                        <div className="p-3 sm:p-4 text-left space-y-1.5 flex flex-col justify-between min-h-[100px] flex-grow bg-white">
                          <div>
                            <h3 className="text-xs sm:text-sm font-light text-black line-clamp-2 mb-1.5 font-futura-pt-light">
                              {product.name || product.title || 'Untitled Product'}
                            </h3>
                            {product.category && (
                              <p className="text-gray-600 text-xs line-clamp-1 font-light font-futura-pt-light">
                                {product.category}
                              </p>
                            )}
                          </div>
                          {/* {productPrice > 0 && (
                            <p className="text-sm sm:text-base font-light text-black font-futura-pt-light mt-auto pt-1">
                              {formatPrice(productPrice, currency)}
                            </p>
                          )} */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Arrows */}
              {newProducts.length > itemsPerView && (
                <>
                  <button
                    onClick={handleCarouselPrev}
                    disabled={carouselIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 hover:border-black p-2.5 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 z-10"
                    aria-label="Previous products"
                  >
                    <ChevronLeft size={20} className="text-black" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={handleCarouselNext}
                    disabled={carouselIndex >= Math.max(0, newProducts.length - itemsPerView)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 hover:border-black p-2.5 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 z-10"
                    aria-label="Next products"
                  >
                    <ChevronRight size={20} className="text-black" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Product Variants */}
      {isImageFull && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setIsImageFull(false)}
        >
          <img
            src={currentImageFull}
            alt={product?.productName}
            className="max-w-full max-h-full object-contain p-4"
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors text-2xl font-light w-8 h-8 flex items-center justify-center z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageFull(false);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {isSizeGuideOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-4 sm:py-6 z-[1300] overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white p-4 sm:p-6 md:p-8 shadow-xl my-auto max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black/60 hover:text-black transition-colors text-xl sm:text-2xl leading-none z-10"
              onClick={handleCloseSizeGuide}
              aria-label="Close size guide"
            >
              ✕
            </button>

            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl text-black mb-4 sm:mb-6 font-light font-futura-pt-book pr-8">
              Size Guide
            </h3>

            {/* Unit Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-text-light/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-base md:text-base lg:text-base text-text-medium font-light font-futura-pt-light whitespace-nowrap">Unit:</span>
                <div className="flex items-center bg-premium-beige/30 rounded-full p-1">
                  <button
                    onClick={() => handleUnitToggle('inches')}
                    className={`px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light transition-all rounded-full ${sizeGuideUnit === 'inches'
                      ? 'bg-black text-white'
                      : 'text-black/70 hover:text-black'
                      }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => handleUnitToggle('cm')}
                    className={`px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light transition-all rounded-full ${sizeGuideUnit === 'cm'
                      ? 'bg-black text-white'
                      : 'text-black/70 hover:text-black'
                      }`}
                  >
                    CM
                  </button>
                </div>
              </div>

              {/* Tab Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFindSize(false)}
                  className={`px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light transition-all border ${!showFindSize
                    ? 'border-black bg-black text-white'
                    : 'border-text-light/20 text-black/70 hover:border-black/40'
                    }`}
                >
                  Size Chart
                </button>
                <button
                  onClick={() => setShowFindSize(true)}
                  className={`px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light transition-all border ${showFindSize
                    ? 'border-black bg-black text-white'
                    : 'border-text-light/20 text-black/70 hover:border-black/40'
                    }`}
                >
                  Find Your Size
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-sm sm:text-base md:text-base lg:text-base text-text-medium leading-relaxed font-futura-pt-light">
              {!showFindSize ? (
                <>
                  {/* Fit Group Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6 border-b border-text-light/20 pb-4">
                    {/* {fitGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setActiveSizeTab(group.id)}
                      className={`px-3 sm:px-4 md:px-5 py-2 text-xs sm:text-sm md:text-base font-light font-futura-pt-light transition-all rounded-full border ${activeSizeTab === group.id
                        ? 'border-black bg-black text-white'
                        : 'border-text-light/20 text-black/70 hover:border-black/40 hover:bg-black/5'
                        }`}
                    >
                      {group.label}
                    </button>
                  ))} */}
                    {/* Fit Group Tabs - only show product key feature */}

                    {fitGroups
                      .filter(group => group.id === product.keyFeatures[0])
                      .map((group) => (
                        <button
                          key={group.id}
                          onClick={() => setActiveSizeTab(group.id)}
                          className={`px-3 sm:px-4 md:px-5 py-2 text-xs sm:text-sm md:text-base font-light font-futura-pt-light transition-all rounded-full border ${activeSizeTab === group.id
                            ? 'border-black bg-black text-white'
                            : 'border-text-light/20 text-black/70 hover:border-black/40 hover:bg-black/5'
                            }`}
                        >
                          {group.label}
                        </button>
                      ))}

                  </div>

                  {/* Size Chart View */}
                  <p className="text-sm sm:text-base md:text-base lg:text-base font-futura-pt-light">
                    <strong>{fitGroups.find(g => g.id === product.keyFeatures[0])?.title}</strong> - Discover your perfect fit. Refer to the measurement chart curated for our signature silhouettes. If you are in-between sizes, we recommend choosing the larger size for a more relaxed drape.
                  </p>

                  {/* <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full border border-premium-beige">
                        <thead>
                          <tr className="bg-premium-beige/60 text-black text-xs sm:text-sm md:text-base lg:text-base">
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">Size</th>
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              Bust ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-black/80">
                          {fitGroups.find(g => g.id === activeSizeTab)?.data.map((row, idx) => (
                            <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-premium-beige/20'}>
                              <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light">
                                {row.size}
                              </td>
                              <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                {convertRange(row.bust, 'inches', sizeGuideUnit)}
                              </td>
                              <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                {convertRange(row.waist, 'inches', sizeGuideUnit)}
                              </td>
                              <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                {convertRange(row.hip, 'inches', sizeGuideUnit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div> */}
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full border border-premium-beige">
                        <thead>
                          <tr className="bg-premium-beige/60 text-black text-xs sm:text-sm md:text-base lg:text-base">
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">Size</th>
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              {product.keyFeatures[0] === 'fitGroupC' ? 'Chest' : 'Bust'} ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>

                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-left font-light font-futura-pt-book">
                              Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-black/80">
                          {fitGroups
                            .filter(g => g.id === product.keyFeatures[0])
                            .flatMap(g => g.data)
                            .map((row, idx) => (
                              <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-premium-beige/20'}>
                                <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-light font-futura-pt-light">
                                  {row.size}
                                </td>
                                <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                  {convertRange(row.bust, 'inches', sizeGuideUnit)}
                                </td>
                                <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                  {convertRange(row.waist, 'inches', sizeGuideUnit)}
                                </td>
                                <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 md:py-3 text-xs sm:text-sm md:text-base lg:text-base font-futura-pt-light">
                                  {convertRange(row.hip, 'inches', sizeGuideUnit)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base lg:text-base text-text-medium font-futura-pt-light">
                    Need assistance? Our client care team is happy to guide you to your ideal size.
                  </p>
                </>
              ) : (
                <>
                  {/* Find Your Size View */}
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-sm sm:text-base md:text-base lg:text-base font-futura-pt-light">
                      Enter your measurements below to find your perfect size. We'll recommend the best size based on your bust, waist, and hip measurements.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm ...">
                          {product.keyFeatures[0] === 'fitGroupC' ? 'Chest' : 'Bust'} ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.bust}
                          onChange={(e) => handleMeasurementChange('bust', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 lg:py-4 text-sm sm:text-base md:text-base lg:text-lg bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50 font-futura-pt-light"
                        />
                      </div>

                      <div>
                        <label className="block text-sm sm:text-base md:text-base lg:text-base font-light text-black font-futura-pt-light mb-2">
                          Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.waist}
                          onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 lg:py-4 text-sm sm:text-base md:text-base lg:text-lg bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50 font-futura-pt-light"
                        />
                      </div>

                      <div>
                        <label className="block text-sm sm:text-base md:text-base lg:text-base font-light text-black font-futura-pt-light mb-2">
                          Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.hip}
                          onChange={(e) => handleMeasurementChange('hip', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 lg:py-4 text-sm sm:text-base md:text-base lg:text-lg bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50 font-futura-pt-light"
                        />
                      </div>
                    </div>

                    {/* Recommended Size Display */}
                    {recommendedSize && (
                      <div className="bg-premium-beige/40 border-2 border-black p-4 sm:p-6 text-center">
                        <p className="text-sm sm:text-base md:text-base lg:text-lg text-text-medium mb-2 font-light font-futura-pt-light">
                          Recommended Size
                        </p>
                        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black mb-4 font-futura-pt-light">
                          {recommendedSize}
                        </p>
                        <p className="text-sm sm:text-base md:text-base lg:text-base text-text-medium font-light font-futura-pt-light">
                          We recommend this size for you
                        </p>
                      </div>
                    )}

                    {!recommendedSize && userMeasurements.bust && userMeasurements.waist && userMeasurements.hip && (
                      <div className="bg-premium-beige/20 border border-text-light/20 p-4 text-center">
                        <p className="text-sm sm:text-base md:text-base lg:text-base text-text-medium font-light font-futura-pt-light">
                          Calculating your recommended size...
                        </p>
                      </div>
                    )}

                    <div className="bg-premium-beige/20 p-3 sm:p-4 rounded-sm">
                      <p className="text-xs sm:text-sm md:text-base lg:text-base text-text-medium font-light leading-relaxed font-futura-pt-light">
                        <strong className="font-light font-futura-pt-light">How to measure:</strong> Use a soft measuring tape. For bust, measure around the fullest part. For waist, measure around the narrowest part. For hip, measure around the fullest part of your hips.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SlidePanel
        open={openSlider}
        onClose={() => setOpenSlider(false)}
        sectionName={activeSection ? activeSection.replace(/([A-Z])/g, ' $1') : ""}
        sectionContent={activeSection ? sections[activeSection] : null}
        keyFeatures={product?.keyFeatures}
        selectedColor={selectedColor}
        productCode={product.productId}
      />


    </div>
  );
};

export default ProductDetailPage;
