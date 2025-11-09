import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Star,
  Truck,
} from "lucide-react";
import { addToCart, getCartDetails, getProductDescription, submitReview, getFilteredProducts } from "../../service/productAPI";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../redux/cartSlice";
import { addToWishlist } from "../../service/wishlist";
import { message } from "../../comman/toster-message/ToastContainer";
import { Share2 } from "lucide-react";

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
  if (typeof price !== 'number') return '0';

  return price.toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const sizeGuideData = [
  { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
  { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
  { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
  { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
  { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
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
  ];
  const savedCountry = localStorage.getItem('selectedCountry');
  const parsedCountry = savedCountry ? JSON.parse(savedCountry) : countryOptions[0];

  // const [selectedCountry] = useState(parsedCountry);
  const [cartItem, setCartItems] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(parsedCountry?.code);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted] = useState(false);
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
  const [userMeasurements, setUserMeasurements] = useState({
    bust: '',
    waist: '',
    hip: ''
  });
  const [recommendedSize, setRecommendedSize] = useState(null);

  // Button Loading States
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [itemAddedToCart, setItemAddedToCart] = useState(false);
  // API State
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState(null);
  const [newProducts, setProducts] = useState([])
  const [monogram, setMonogram] = useState("")
  const MONOGRAM_CHAR_LIMIT = 12;
  // Review Form State
  const [averageProdRating, setAverageProdRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);


  const fetchProductDetail = useCallback(async (productId) => {
    setIsLoading(true)
    try {
      const response = await getProductDescription(productId);
      setProduct(response.data);
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
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId, fetchProductDetail]);

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

  const availableQuantity = product
    ? getAvailableQuantity(product.priceList, selectedCountry, selectedSize)
    : 0;

  const handlePrevImage = () => {
    if (!product || product.images.length === 0) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!product || product.images.length === 0) return;
    setSelectedImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
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
      (item) => item.id === safeProduct.id && item.size === selectedSize
    );

    if (itemIndex !== -1) {

      cart[itemIndex] = {
        ...cart[itemIndex],
        quantity: quantity,
      };
    } else {

      cart.push({
        ...safeProduct,
        size: selectedSize,
        country: selectedCountry,
        quantity: quantity,
        country: selectedCountry,
        monogram: monogram,
        color:selectedColor
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
          note: "",
          success: true,
          message: "OK",
          suggestedCountryPrice: null,
          monogram: monogram
        },


      ],
    };
    navigate("/checkout/buynow", { state: { checkoutProd, selectedCountry, selectedSize, quantity } });
  };


  // Wishlist toggle
  const handleAddToWishlist = async (productId) => {
    setAddingToWishlist(true);
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

    }

    try {
      const result = await addToWishlist(productId, payload);
      console.log("Added to wishlist:", result);
      message.success("Product added to wishlist!");
    } catch (err) {
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
          <h2 className="text-xl font-light text-black mb-3 uppercase tracking-widest">
            Product Not Found
          </h2>
          <p className="text-text-medium text-sm mb-8 leading-relaxed">
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
  const currentImage = product.images[selectedImageIndex] || product.images[0];
  const hasMultipleImages = product.images.length > 1;
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
      className="min-h-screen bg-white font-futura"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10">

        {/* Breadcrumb */}
        <div className="mb-6 md:mb-8 text-sm  font-light tracking-widest">
          <a href="/" className="hover:text-black transition-colors">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-black transition-colors">Products</a>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">

          {/* Left Column - Images */}
          <div className="space-y-3 md:space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white overflow-hidden group">
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  setIsImageFull(true);
                  setCurrentImageFull(currentImage.url);
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
                }}
              />
              <button
                onClick={handleShare}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Share2 className="w-4 h-4 text-black" strokeWidth={1.5} />
              </button>

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} className="text-black" strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} className="text-black" strokeWidth={2} />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-0.5 rounded-full transition-all ${index === selectedImageIndex
                        ? 'w-5 bg-black'
                        : 'w-1 bg-black/20'
                        }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2.5">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white overflow-hidden transition-all ${index === selectedImageIndex
                      ? 'ring-1 ring-black'
                      : 'ring-[0.5px] ring-text-light/20 hover:ring-text-light/40'
                      }`}
                  >
                    <img
                      src={image.thumbnailUrl}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6 md:space-y-7">

            {/* Product Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 uppercase tracking-widest mb-3 leading-tight font-futura">
                {product.name}
              </h1>
              

              {/* Rating
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < Math.floor(averageProdRating)
                            ? "fill-black text-black"
                            : "fill-none text-text-light"
                        }
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-medium font-light">
                    {averageProdRating} ({product.reviews.length} review{product.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              )} */}
            </div>

            {/* Country Selector */}
            {/* <div className="mt-4">
              <label htmlFor="country" className="block text-sm text-text-light mb-1">
                Select Country
              </label>
              <select
                id="country"
                name="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full px-4 py-2 border border-text-light/20 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Debug or use selected country */}
            <div className="text-sm text-text-medium font-semibold text-black">
              Product ID: <span className="font-semibold text-black">{product.productId}</span><br />
              Selected Country: <span className="font-semibold text-black">{selectedCountry}</span>

            </div>
            {/* Price - Based on selectedCountry and selectedSize */}
            <div className="py-4 border-y border-text-light/10">
              <div className="flex items-baseline gap-3">
                {(() => {
                  const matchedPrice = product.priceList?.find(
                    (item) =>
                      item.country === selectedCountry &&
                      item.size === selectedSize
                  );

                  return matchedPrice ? (
                    <>
                      <span className="text-2xl md:text-3xl font-light text-black tracking-tight">
                        {formatPrice(matchedPrice.priceAmount, matchedPrice.currency)}
                        <p className="text-sm ">(Inc. all taxes)</p>
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-red-500 font-light">Item not available</span>
                  );
                })()}
              </div>
            </div>
            {/* Color Selection */}
            {product?.availableColors?.length > 0 && (
              <div className="bg-white border border-text-light/10 p-3 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                    Color
                  </h3>
                  <span className="text-xs text-text-medium font-semibold">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-hide px-1 -mx-1">
                  {product?.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setItemAddedToCart(false);
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 border transition-all duration-300 uppercase text-xs tracking-widest font-light rounded-full relative group min-h-[28px] flex items-center justify-center ${selectedColor === color
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

            {/* Size Selection */}
            {product.sizeOfProduct.length > 0 && (
              <div className="bg-white border border-text-light/10 p-3 rounded-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                      Size
                    </h3>
                    <span className="text-xs text-text-medium font-light">
                      {selectedSize}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-black/80 backdrop-blur-sm transition-all hover:border-black/30 hover:bg-black hover:text-white hover:shadow-md hover:shadow-black/10"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-black/60 to-black/90"></span>
                    Size Guide
                  </button>

                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-hide px-1 -mx-1">
                  {product.sizeOfProduct.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setItemAddedToCart(false);
                      }}
                      className={`flex-shrink-0 w-10 h-10 border transition-all duration-300 uppercase text-xs tracking-widest font-light rounded-sm relative group flex items-center justify-center min-h-[28px] ${selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-text-light/20 text-black hover:border-black/40 hover:bg-black/5'
                        }`}
                    >
                      {selectedSize === size && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-xs font-bold text-black mb-3 uppercase tracking-widest">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-text-light/20">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-premium-beige transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="px-5 py-2.5 font-light text-sm min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= availableQuantity}
                    className="p-2.5 hover:bg-premium-beige transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>

              </div>
            </div>

            {/* Personalisation */}
            <div className="bg-white border border-text-light/10 p-4 rounded-sm space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                  Add Monogram
                </h3>
                <span className="text-[11px] text-text-medium">
                  {monogram.length}/{MONOGRAM_CHAR_LIMIT}
                </span>
              </div>
              <p className="text-sm text-text-medium font-light leading-relaxed">
                Personalise this piece with refined initials or a short note.
              </p>
              <input
                type="text"
                value={monogram}
                onChange={(e) => setMonogram(e.target.value)}
                maxLength={MONOGRAM_CHAR_LIMIT}
                placeholder="Add Monogram text"
                className="w-full px-3 py-2 text-sm bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light tracking-wide"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              {availableQuantity === 0 ? (
                // Out of Stock - Show only one button
                <div className="flex gap-2.5 sm:gap-3 flex-1">
                  <button
                    disabled
                    className="flex-1 bg-text-light text-white py-3 px-4 font-light uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-not-allowed min-h-[42px]"
                  >
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    <span className="text-xs">Out of Stock</span>
                  </button>
                </div>
              ) : (
                // In Stock - Show both buttons
                <div className="flex gap-2.5 sm:gap-3 flex-1">
                  <button
                    onClick={itemAddedToCart ? handleGoToCart : () => handleAddToCart(product, selectedSize, selectedCountry, quantity)}
                    disabled={
                      !selectedColor ||
                      !selectedSize ||
                      !matchedPrice ||
                      addingToCart
                    }
                    className="flex-1 bg-black text-white py-3 px-4 font-light hover:bg-text-dark transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:bg-text-light disabled:cursor-not-allowed min-h-[42px]"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        <span className="text-xs">
                          {!matchedPrice
                            ? 'Price Not Available'
                            : itemAddedToCart
                              ? 'Go to Cart'
                              : 'Add to Cart'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={
                      !selectedColor ||
                      !selectedSize ||
                      !matchedPrice ||
                      addingToCart
                    }
                    className="flex-1 bg-black text-white py-3 px-4 font-light hover:bg-text-dark transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:bg-text-light disabled:cursor-not-allowed min-h-[42px]"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        <span className="text-xs">
                          {!matchedPrice
                            ? 'Price Not Available'
                            : 'Buy Now'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => handleAddToWishlist(product.id)}
                disabled={addingToWishlist}
                className={`p-3 border transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[42px] flex items-center justify-center ${isWishlisted
                  ? 'border-black bg-black'
                  : 'border-text-light/20 hover:border-black'
                  }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {addingToWishlist ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart
                    size={14}
                    strokeWidth={1.5}
                    className={`${isWishlisted ? 'fill-white text-white' : 'text-black'}`}
                  />
                )}
              </button>
            </div>


            {/* Shipping Info */}
            {shippingInfo && (
              <div className="flex items-start gap-2.5">
                <Truck size={16} className="text-text-medium mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-light text-black uppercase tracking-widest">Shipping Charges</p>
                  <p className="text-xs text-text-medium font-light">
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
                  <p className="text-xs text-text-medium">30-day return policy</p>
                </div>
              </div>
            </div> */}

            {/* Description */}
            {product.description && (
              <div className="pt-5 border-t border-text-light/10">
                <p className="text-text-medium text-sm leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            {(product.keyFeatures.length > 0 || Object.keys(product.specifications).length > 0 || product.fabricType.length > 0) && (
              <div className="space-y-5 pt-5 border-t border-text-light/10">

                {/* Key Features */}
                {product.keyFeatures.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, keyFeatures: !prev.keyFeatures }))}
                      className="flex items-center justify-between w-full text-left mb-2.5"
                    >
                      <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                        Key Features
                      </h3>
                      {expandedSections.keyFeatures ? (
                        <Minus size={14} className="text-black" strokeWidth={2} />
                      ) : (
                        <Plus size={14} className="text-black" strokeWidth={2} />
                      )}
                    </button>
                    {expandedSections.keyFeatures && (
                      <ul className="space-y-1.5">
                        {product.keyFeatures.map((feature, index) => (
                          <li key={index} className="text-xs text-text-medium flex items-start font-light leading-relaxed">
                            <span className="mr-2 mt-1">•</span>
                            <span className="font-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Fabric Type */}
                {product.fabricType.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, fabric: !prev.fabric }))}
                      className="flex items-center justify-between w-full text-left mb-2.5"
                    >
                      <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                        Fabric
                      </h3>
                      {expandedSections.fabric ? (
                        <Minus size={14} className="text-black" strokeWidth={2} />
                      ) : (
                        <Plus size={14} className="text-black" strokeWidth={2} />
                      )}
                    </button>
                    {expandedSections.fabric && (
                      <p className="text-xs text-text-medium font-light">
                        {product.fabricType.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Care Instructions */}
                {product.careInstructions.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, careInstructions: !prev.careInstructions }))}
                      className="flex items-center justify-between w-full text-left mb-2.5"
                    >
                      <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                        Care Instructions
                      </h3>
                      {expandedSections.careInstructions ? (
                        <Minus size={14} className="text-black" strokeWidth={2} />
                      ) : (
                        <Plus size={14} className="text-black" strokeWidth={2} />
                      )}
                    </button>
                    {expandedSections.careInstructions && (
                      <ul className="space-y-1.5">
                        {product.careInstructions.map((instruction, index) => (
                          <li key={index} className="text-xs text-text-medium flex items-start font-light leading-relaxed">
                            <span className="mr-2 mt-1">•</span>
                            <span className="font-light">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Review Form Section */}
        { false && <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-text-light/10">
          <h2 className="text-lg md:text-xl font-light text-black uppercase tracking-widest mb-5 md:mb-6 font-sweet-sans">
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
        </div> }

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
          <div className="space-y-5 pt-6 md:pt-8 border-t border-text-light/10">
            <h3 className="text-xs md:text-sm font-bold text-black mb-4 uppercase tracking-widest font-sweet-sans">
              Hot Picks Just For You
            </h3>

            <div className="relative px-0 py-4">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div
                  className="flex items-stretch transition-transform duration-300 ease-in-out gap-4 md:gap-5"
                  style={{
                    transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)`
                  }}
                >
                  {newProducts.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex-shrink-0 w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1.33rem)] group border border-text-light/10 overflow-hidden bg-white hover:border-text-light/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
                      onClick={() => navigate(`/productDetail/${variant?.id}`)}
                    >
                      {/* Image Section */}
                      <div className="aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={variant.images[0]}
                          alt={`${variant.color} ${variant.size}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) =>
                          (e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=")
                          }
                        />
                      </div>

                      {/* Info Section */}
                      <div className="p-3 text-center space-y-1 flex flex-col justify-between min-h-[70px] flex-grow">
                        <p className="text-xs font-semibold text-black uppercase tracking-widest line-clamp-1">{variant.name}</p>
                        <p className="text-xs text-text-medium line-clamp-2 font-light">
                          {variant.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {newProducts.length > itemsPerView && (
                <>
                  <button
                    onClick={handleCarouselPrev}
                    disabled={carouselIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 shadow-sm hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    aria-label="Previous products"
                  >
                    <ChevronLeft size={18} className="text-black" strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleCarouselNext}
                    disabled={carouselIndex >= Math.max(0, newProducts.length - itemsPerView)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 shadow-sm hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    aria-label="Next products"
                  >
                    <ChevronRight size={18} className="text-black" strokeWidth={2} />
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
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsImageFull(false)}
        >
          <img
            src={currentImageFull}
            alt={product?.productName}
            className="max-w-full max-h-full object-contain p-4"
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors text-2xl font-light w-8 h-8 flex items-center justify-center"
            onClick={() => setIsImageFull(false)}
          >
            ✕
          </button>
        </div>
      )}

      {isSizeGuideOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-4 sm:py-6 z-[60] overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white p-4 sm:p-6 md:p-8 shadow-xl my-auto max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black/60 hover:text-black transition-colors text-xl sm:text-2xl leading-none z-10"
              onClick={handleCloseSizeGuide}
              aria-label="Close size guide"
            >
              ✕
            </button>

            <h3 className="text-sm sm:text-base md:text-lg uppercase tracking-[0.3em] text-black mb-4 sm:mb-6 font-light font-sweet-sans pr-8">
              Size Guide
            </h3>

            {/* Unit Toggle and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 border-b border-text-light/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-text-medium font-light uppercase tracking-widest whitespace-nowrap">Unit:</span>
                <div className="flex items-center bg-premium-beige/30 rounded-full p-1">
                  <button
                    onClick={() => handleUnitToggle('inches')}
                    className={`px-2.5 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-light uppercase tracking-widest transition-all rounded-full ${sizeGuideUnit === 'inches'
                        ? 'bg-black text-white'
                        : 'text-black/70 hover:text-black'
                      }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => handleUnitToggle('cm')}
                    className={`px-2.5 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-light uppercase tracking-widest transition-all rounded-full ${sizeGuideUnit === 'cm'
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
                  className={`px-2.5 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-light uppercase tracking-widest transition-all border ${!showFindSize
                      ? 'border-black bg-black text-white'
                      : 'border-text-light/20 text-black/70 hover:border-black/40'
                    }`}
                >
                  Size Chart
                </button>
                <button
                  onClick={() => setShowFindSize(true)}
                  className={`px-2.5 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-light uppercase tracking-widest transition-all border ${showFindSize
                      ? 'border-black bg-black text-white'
                      : 'border-text-light/20 text-black/70 hover:border-black/40'
                    }`}
                >
                  Find Your Size
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm text-text-medium leading-relaxed">
              {!showFindSize ? (
                <>
                  {/* Size Chart View */}
                  <p className="text-xs sm:text-sm">
                    Discover your perfect fit. Refer to the measurement chart curated for our signature silhouettes. If you are in-between sizes, we recommend choosing the larger size for a more relaxed drape.
                  </p>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full border border-premium-beige">
                        <thead>
                          <tr className="bg-premium-beige/60 text-black uppercase tracking-[0.25em] text-[10px] sm:text-[11px]">
                            <th className="px-3 sm:px-4 py-2 text-left font-light">Size</th>
                            <th className="px-3 sm:px-4 py-2 text-left font-light">
                              Bust ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-left font-light">
                              Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-left font-light">
                              Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-black/80">
                          {sizeGuideData.map((row, idx) => (
                            <tr key={row.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-premium-beige/20'}>
                              <td className="px-3 sm:px-4 py-2 uppercase tracking-[0.25em] text-[10px] sm:text-[11px] font-light">
                                {row.size}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs">
                                {convertRange(row.bust, 'inches', sizeGuideUnit)}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs">
                                {convertRange(row.waist, 'inches', sizeGuideUnit)}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs">
                                {convertRange(row.hip, 'inches', sizeGuideUnit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-text-medium">
                    Need assistance? Our client care team is happy to guide you to your ideal size.
                  </p>
                </>
              ) : (
                <>
                  {/* Find Your Size View */}
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-xs sm:text-sm">
                      Enter your measurements below to find your perfect size. We'll recommend the best size based on your bust, waist, and hip measurements.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-light text-black uppercase tracking-widest mb-2">
                          Bust ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.bust}
                          onChange={(e) => handleMeasurementChange('bust', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-light text-black uppercase tracking-widest mb-2">
                          Waist ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.waist}
                          onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-light text-black uppercase tracking-widest mb-2">
                          Hip ({sizeGuideUnit === 'inches' ? 'in' : 'cm'})
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={userMeasurements.hip}
                          onChange={(e) => handleMeasurementChange('hip', e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-text-light/20 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-black placeholder:text-text-light/50"
                        />
                      </div>
                    </div>

                    {/* Recommended Size Display */}
                    {recommendedSize && (
                      <div className="bg-premium-beige/40 border-2 border-black p-4 sm:p-6 text-center">
                        <p className="text-xs sm:text-sm text-text-medium uppercase tracking-widest mb-2 font-light">
                          Recommended Size
                        </p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-light text-black uppercase tracking-widest mb-2">
                          {recommendedSize}
                        </p>
                        <p className="text-xs sm:text-sm text-text-medium font-light">
                          We recommend this size for you
                        </p>
                      </div>
                    )}

                    {!recommendedSize && userMeasurements.bust && userMeasurements.waist && userMeasurements.hip && (
                      <div className="bg-premium-beige/20 border border-text-light/20 p-4 text-center">
                        <p className="text-xs sm:text-sm text-text-medium font-light">
                          Calculating your recommended size...
                        </p>
                      </div>
                    )}

                    <div className="bg-premium-beige/20 p-3 sm:p-4 rounded-sm">
                      <p className="text-[10px] sm:text-[11px] text-text-medium font-light leading-relaxed">
                        <strong className="font-light uppercase tracking-widest">How to measure:</strong> Use a soft measuring tape. For bust, measure around the fullest part. For waist, measure around the narrowest part. For hip, measure around the fullest part of your hips.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductDetailPage;
