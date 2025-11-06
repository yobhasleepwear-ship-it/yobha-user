import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [selectedCountry, setSelectedCountry] = useState(parsedCountry?.code || "IN");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const autoCarouselRef = useRef(null);

  // Safe data extraction with null checks
  const productId = product?.id || '';
  const productName = product?.name || 'Untitled Product';
 
  const matchedPrice = product?.priceList?.find(
    (e) => e.country === selectedCountry && e.size === product?.availableSizes?.[0]
  );
  console.log(matchedPrice,"matchedprice")
  const productPrice = matchedPrice?.priceAmount || 0;
  const currency = matchedPrice?.currency || "";
  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='];
  const hasMultipleImages = productImages.length > 1;
  const availableColors = Array.isArray(product?.availableColors) ? product.availableColors : [];
  const availableSizes = Array.isArray(product?.availableSizes) ? product.availableSizes : [];


  const handleCardClick = () => {

    if (productId) {
      try {
        console.log("i am in ")
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

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Auto carousel effect - Always running like TrendingNewArrivals
  useEffect(() => {
    if (hasMultipleImages) {
      autoCarouselRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 3000); // Change image every 3 seconds
    }

    return () => {
      if (autoCarouselRef.current) {
        clearInterval(autoCarouselRef.current);
      }
    };
  }, [hasMultipleImages, productImages.length]);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 ease-out cursor-pointer flex flex-col backdrop-blur-sm transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        } hover:-translate-y-2 hover:scale-[1.02]`}
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Image Container - Luxury Design */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 group/image shadow-inner">
        {/* Carousel Images */}
        <div className="relative w-full h-full">
          {productImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${productName} - ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${index === currentImageIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
                } group-hover:scale-110 group-hover/image:scale-105`}
              style={{
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+';
              }}
            />
          ))}
        </div>

        {/* Elegant Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

        {/* Navigation Arrows - Premium Design */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur-md shadow-xl opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-500 z-20 rounded-full border border-gray-100 hover:scale-110 hover:shadow-2xl transform -translate-x-2 group-hover:translate-x-0"
              style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} className="text-gray-700 transition-transform duration-300 hover:scale-110" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur-md shadow-xl opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-500 z-20 rounded-full border border-gray-100 hover:scale-110 hover:shadow-2xl transform translate-x-2 group-hover:translate-x-0"
              style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label="Next image"
            >
              <ChevronRight size={18} className="text-gray-700 transition-transform duration-300 hover:scale-110" />
            </button>
          </>
        )}


        {/* Image Indicator Dots - Refined Design */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`h-1.5 rounded-full transition-all duration-500 hover:scale-125 ${index === currentImageIndex
                  ? 'w-8 bg-white shadow-lg scale-110'
                  : 'w-1.5 bg-white/50 hover:bg-white/80 hover:scale-110'
                  }`}
                style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content - Luxury Typography */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 bg-white group/content shadow-sm">
        {/* Product Name - Elegant Typography with Fixed Height */}
        <div className="h-12 sm:h-14 mb-3 sm:mb-4 flex items-start overflow-hidden">
          <h3 className="text-gray-900 font-light text-sm sm:text-lg line-clamp-2 tracking-wide uppercase group-hover:text-gray-500 transition-all duration-700 leading-relaxed transform group-hover:translate-x-1">
            {productName}
          </h3>
        </div>

        {/* Size Information - Minimal Design with Flexible Height */}
        <div className="min-h-[1.25rem] sm:min-h-[1.5rem] mb-2 sm:mb-3 flex items-center">
          {availableSizes.length > 0 && (
            <p className="text-gray-500 text-xs tracking-widest uppercase font-light transition-all duration-700 transform group-hover:translate-x-1 group-hover:text-gray-700 leading-tight">
              Sizes: <span className="text-gray-700 font-medium transition-colors duration-500 group-hover:text-gray-500">{availableSizes.join(', ')}</span>
            </p>
          )}
        </div>
        {/* Price - Consistent Typography with Fixed Height */}
        <div className="h-6 sm:h-7 flex items-center mt-auto">
          <p className="text-gray-900 text-sm sm:text-base font-light tracking-wide uppercase font-sweet-sans">
            {currency} {productPrice}
          </p>
        </div>
        {/* Subtle shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
      </div>
    </div>
  );
};

export default ProductCard;
