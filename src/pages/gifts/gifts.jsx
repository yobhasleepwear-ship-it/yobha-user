import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { getFilteredProducts } from "../../service/productAPI";
// Import dummy images from assets
import heroImage from "../../assets/heroImage.jpg";
import coupleHero from "../../assets/couple-hero1.jpg";
import familyHero from "../../assets/family-hero.jpg";
import kidsHero from "../../assets/kids-hero.jpg";
import petHero from "../../assets/pet-hero.jpg";
import womenImage from "../../assets/Women.png";
import menImage from "../../assets/Men.png";
import bathrobe from "../../assets/bathrobe.jpg";
import cushions from "../../assets/CUSHIONS.jpg";
import eyemasks from "../../assets/EYEMASKS.jpg";
import headband from "../../assets/HEADBAND.jpg";
import scrunchies from "../../assets/SCRUNCHIES.jpg";
import socks from "../../assets/SOCKS.jpg";
import towel from "../../assets/towel.jpg";

const Gifts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const stickyHeaderRef = React.useRef(null);
  const headerTriggerRef = React.useRef(null);
  
  // Category mapping
  const categoryMap = {
    'Women': { name: 'Gifts for Her', segment: 'Women', bannerImage: null },
    'Men': { name: 'Gifts for Him', segment: 'Men', bannerImage: null },
    'Family': { name: 'Gifts for Family', segment: 'Family', bannerImage: null },
    'kids': { name: 'Gifts for Kids', segment: 'Kids', bannerImage: null },
    'PetWear': { name: 'Gifts for Pets', segment: 'PetWear', bannerImage: null },
  };

  const currentCategory = categoryParam ? categoryMap[categoryParam] : categoryMap['Women'];
  const categorySegment = currentCategory?.segment || 'Women';

  // Fetch products when category is selected
  const fetchProducts = useCallback(async () => {
    if (!categorySegment) return;
    
    setIsLoading(true);
    try {
      const payload = {
        q: '',
        category: null,
        subCategory: categorySegment,
        minPrice: null,
        maxPrice: null,
        pageNumber: null,
        pageSize: 100,
        sort: 'latest',
        country: null,
      };

      const response = await getFilteredProducts(payload);

      if (response && response.success && response.data) {
        setProducts(response.data.items || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [categorySegment]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (headerTriggerRef.current && stickyHeaderRef.current) {
        const triggerRect = headerTriggerRef.current.getBoundingClientRect();
        const shouldBeSticky = triggerRect.bottom <= 0;
        setIsSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Get product image
  const getProductImage = (product) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0].url || product.images[0].thumbnailUrl;
    }
    return product?.image || '';
  };

  // Format price helper
  const formatPrice = (product) => {
    const savedCountry = localStorage.getItem('selectedCountry');
    const parsedCountry = savedCountry ? JSON.parse(savedCountry) : { code: 'IN' };
    const selectedCountry = parsedCountry?.code || 'IN';
    
    if (product?.priceList && Array.isArray(product.priceList) && product.priceList.length > 0) {
      const firstSize = product?.availableSizes?.[0];
      let matchedPrice = product.priceList.find(
        (e) => e.country === selectedCountry && e.size === firstSize
      );
      
      if (!matchedPrice) {
        matchedPrice = product.priceList.find((e) => e.country === selectedCountry);
      }
      
      if (!matchedPrice) {
        matchedPrice = product.priceList[0];
      }
      
      const price = matchedPrice?.priceAmount || 0;
      const currency = matchedPrice?.currency || 'INR';
      
      if (price === 0 && product?.price && product.price > 0) {
        return `${currency === 'INR' ? '₹' : '$'}${product.price.toLocaleString()}`;
      }
      
      const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
      return `${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    
    return '';
  };

  // Handle product click
  const handleProductClick = (product) => {
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
  };

  // Dummy images array for products
  const dummyProductImages = [
    womenImage,
    menImage,
    bathrobe,
    cushions,
    eyemasks,
    headband,
    scrunchies,
    socks,
    towel,
    coupleHero,
    familyHero,
    kidsHero,
    petHero,
  ];

  // Get banner image - use first product image or fallback to category-specific dummy image
  const getBannerImage = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      const productImg = getProductImage(firstProduct);
      if (productImg) return productImg;
    }
    // Fallback to category-specific dummy images
    const bannerMap = {
      'Women': heroImage,
      'Men': menImage,
      'Family': familyHero,
      'Kids': kidsHero,
      'PetWear': petHero,
    };
    return bannerMap[categorySegment] || heroImage;
  };

  // Determine grid layout pattern based on wireframe
  // Pattern repeats every 4 rows:
  // Row 1: 4 singles (indices 0-3)
  // Row 2: 2 singles + 1 double (indices 4-6, where 6 is double)
  // Row 3: 4 singles (indices 7-10)
  // Row 4: 1 double + 2 singles (indices 11-13, where 11 is double)
  const getGridLayout = (index) => {
    // Calculate position in the repeating 16-item block (4 rows)
    const positionInBlock = index % 16;
    
    // Row 1 in block (0-3): all singles
    if (positionInBlock < 4) {
      return 'col-span-1';
    }
    
    // Row 2 in block (4-6): first 2 singles, then 1 double
    if (positionInBlock < 7) {
      if (positionInBlock === 6) {
        return 'col-span-2';
      }
      return 'col-span-1';
    }
    
    // Row 3 in block (7-10): all singles
    if (positionInBlock < 11) {
      return 'col-span-1';
    }
    
    // Row 4 in block (11-13): first is double, rest are singles
    if (positionInBlock < 14) {
      if (positionInBlock === 11) {
        return 'col-span-2';
      }
      return 'col-span-1';
    }
    
    // Shouldn't reach here, but default to single
    return 'col-span-1';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-futura-pt-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm font-light">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* First Header Section - Above Hero Image */}
        <div className="flex items-center py-4 sm:py-5 md:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm sm:text-base md:text-lg font-light text-black uppercase tracking-wider">
              {currentCategory.name}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 font-light">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Large Hero Banner Image */}
        <div ref={headerTriggerRef} className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] mb-6 sm:mb-8 overflow-hidden bg-gray-100">
          <img
            src={getBannerImage()}
            alt={currentCategory.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Second Header Section - Below Hero Image (Sticky on Scroll) */}
        <div 
          ref={stickyHeaderRef}
          className={`sticky top-0 z-50 bg-white border-b border-gray-200 mb-6 transition-shadow duration-200 ${
            isSticky ? 'shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3 sm:py-4">
              <button
                onClick={() => {
                  const categories = Object.keys(categoryMap);
                  const currentIndex = categories.findIndex(cat => categoryMap[cat].segment === currentCategory.segment);
                  const nextIndex = (currentIndex + 1) % categories.length;
                  navigate(`/gifts?category=${categories[nextIndex]}`);
                }}
                className="flex items-center gap-1.5 sm:gap-2 text-black hover:text-gray-600 transition-colors uppercase tracking-wider text-sm sm:text-base font-light"
              >
                <span>{currentCategory.name}</span>
                <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 text-black hover:text-gray-600 transition-colors uppercase tracking-wider text-xs sm:text-sm font-light"
              >
                <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                <span className="hidden xs:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid - Wireframe Layout */}
        {products.length > 0 ? (
          <div className="grid grid-cols-4 gap-0 mb-12">
            {products.map((product, index) => {
              const gridClass = getGridLayout(index);
              const productImage = getProductImage(product);
              const productPrice = formatPrice(product);

              return (
                <div
                  key={product.id || index}
                  className={`${gridClass} cursor-pointer group overflow-hidden bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative w-full h-full aspect-square overflow-hidden">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name || product.productName || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to dummy image if product image fails
                          e.target.src = dummyProductImages[index % dummyProductImages.length];
                        }}
                      />
                    ) : (
                      <img
                        src={dummyProductImages[index % dummyProductImages.length]}
                        alt="Product"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    
                    {/* Price Overlay - Shows on Hover */}
                    {productPrice && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="text-white text-lg md:text-xl font-light uppercase tracking-wider">
                            {productPrice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-600 text-sm font-light">No products found for this category.</p>
          </div>
        )}

        {/* Filters Sidebar */}
        {showFilters && (
          <div className="fixed inset-0 z-[1300]">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilters(false)}
            ></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-light text-black uppercase tracking-wider text-sm">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-black hover:text-gray-600 transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={24} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 font-light">Filter options coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gifts;

