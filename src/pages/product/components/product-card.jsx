import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { addToWishlist } from "../../../service/wishlist";
import { message } from "../../../comman/toster-message/ToastContainer";
import * as localStorageService from "../../../service/localStorageService";
import { LocalStorageKeys } from "../../../constants/localStorageKeys";

/**
 * ProductCard Component - Luxury Gucci-inspired design
 * 
 * Props:
 * @param {Object} product - Product data object
 * 
 * Expected product structure (from API):
 * {
 *   id: string,
 *   productId: string,
 *   name: string,
 *   price: number,
 *   category: string,
 *   images: string[],
 *   available: boolean,
 *   productMainCategory: string,
 *   availableColors: string[],
 *   availableSizes: string[]
 * }
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const savedCountry = localStorage.getItem('selectedCountry');
  const parsedCountry = JSON.parse(savedCountry);
  const [selectedCountry] = useState(parsedCountry?.code || "IN");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const autoCarouselRef = useRef(null);

  // Safe data extraction with null checks
  const productId = product?.id || '';
  const productName = product?.name || 'Untitled Product';
 
  // Price matching logic with fallbacks:
  // 1. Try to find price matching both country and size
  // 2. If not found, try to find any price for the selected country
  // 3. If still not found, use the base price field from product
  // 4. Only then default to 0
  let matchedPrice = null;
  let productPrice = 0;
  let currency = "";
  
  if (product?.priceList && Array.isArray(product.priceList) && product.priceList.length > 0) {
    // First try: exact match (country + size)
    const firstSize = product?.availableSizes?.[0];
    matchedPrice = product.priceList.find(
      (e) => e.country === selectedCountry && e.size === firstSize
    );
    
    // Second try: match by country only (any size)
    if (!matchedPrice) {
      matchedPrice = product.priceList.find(
        (e) => e.country === selectedCountry
      );
    }
    
    // Third try: any price from priceList (fallback to first available)
    if (!matchedPrice) {
      matchedPrice = product.priceList[0];
    }
    
    productPrice = matchedPrice?.priceAmount || 0;
    currency = matchedPrice?.currency || "";
  }
  
  // If no price found in priceList, use the base price field
  if (productPrice === 0 && product?.price && product.price > 0) {
    productPrice = product.price;
    // Try to determine currency from priceList or default to INR
    currency = product?.priceList?.[0]?.currency || "INR";
  }
  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='];
  const hasMultipleImages = productImages.length > 1;
  
  // Format price
  const formatPrice = (price, currency = 'INR') => {
    if (typeof price !== 'number') return '₹0.00';
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    return `${symbol} ${price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };


  const handleCardClick = () => {
    if (productId) {
      try {
        const existing = JSON.parse(localStorage.getItem("recentVisited")) || [];
        const filtered = existing.filter((p) => p.id !== productId);
        const updated = [product, ...filtered];
        const limited = updated.slice(0, 8);
        localStorage.setItem("recentVisited", JSON.stringify(limited));
      } catch (err) {
        console.error("Error saving recent visited products:", err);
      }
      navigate(`/productDetail/${productId}`);
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);

    if (!token) {
      message.info("Please log in to add items to your wishlist.");
      navigate("/login");
      return;
    }

    if (wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);
      const payload = {
        productId: product.slug || product.id,
        size: "",
        desiredQuantity: 1,
        desiredSize: "",
        desiredColor: "",
        notifyWhenBackInStock: false,
      };

      await addToWishlist(product.id, payload);
      setIsWishlisted(true);
      message.success("Added to wishlist");
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      message.error("Unable to add to wishlist right now.");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Auto carousel effect - Speed up on hover
  useEffect(() => {
    if (hasMultipleImages) {
      // Clear existing interval
      if (autoCarouselRef.current) {
        clearInterval(autoCarouselRef.current);
      }
      
      // Set interval based on hover state
      const intervalTime = isHovered ? 2000 : 4000; // Faster on hover
      autoCarouselRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, intervalTime);
    }

    return () => {
      if (autoCarouselRef.current) {
        clearInterval(autoCarouselRef.current);
      }
    };
  }, [hasMultipleImages, productImages.length, isHovered]);

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
        if (token) {
          // You can implement getWishlist check here if needed
          // For now, we'll rely on the state after adding
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };
    checkWishlist();
  }, [productId]);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      observer.observe(currentCardRef);
    }

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white overflow-hidden cursor-pointer flex flex-col w-full"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(1rem)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        border: 'none',
        boxShadow: 'none',
        outline: 'none'
      }}
    >
      {/* Image Container - Clean Minimal Design with Hover Effects */}
      <div 
        className="relative w-full overflow-hidden bg-white"
        style={{
          aspectRatio: '1 / 1',
          border: 'none',
          boxShadow: isHovered ? '0 10px 30px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'box-shadow 0.5s ease-out, transform 0.5s ease-out',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
        }}
      >
        {/* Carousel Images with Zoom Effect */}
        <div className="relative w-full h-full overflow-hidden">
          {productImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${productName} - ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover ${index === currentImageIndex
                ? 'opacity-100'
                : 'opacity-0'
                }`}
              style={{
                transition: isHovered 
                  ? 'opacity 0.6s ease-in-out, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'opacity 1s ease-in-out, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered && index === currentImageIndex 
                  ? 'scale(1.08)' 
                  : 'scale(1)'
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
              }}
            />
          ))}
        </div>

        {/* Heart Icon - Top Right */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          className="absolute top-2 right-2 z-20 p-1.5 hover:opacity-70 transition-opacity duration-200 disabled:opacity-50 touch-manipulation"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            className={`transition-colors ${isWishlisted ? "text-black fill-black" : "text-black"}`}
          />
        </button>
      </div>

      {/* Content - Minimal Clean Design with Hover Animation */}
      <div 
        className="p-3 sm:p-4 bg-white flex flex-col w-full"
        style={{
          border: 'none',
          boxShadow: 'none',
          transition: 'transform 0.5s ease-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
        }}
      >
        {/* Product Name */}
        <h3 
          className="text-black font-light font-futura-pt-light mb-2 line-clamp-2 transition-colors duration-300"
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontWeight: 300,
            color: isHovered ? '#1a1a1a' : '#000000'
          }}
        >
          {productName}
        </h3>

        {/* Price */}
        <p 
          className="text-black font-light font-futura-pt-light transition-all duration-300"
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontWeight: 300,
            transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
          }}
        >
          {formatPrice(productPrice, currency)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
