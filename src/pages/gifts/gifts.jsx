import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Heart } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { getFilteredProducts } from "../../service/productAPI"; // Will be used when API is enabled
import { addToWishlist, getWishlist } from "../../service/wishlist";
import { getCachedWishlist, invalidateWishlistCache } from "../../service/wishlistCache";
import { useDispatch } from "react-redux";
import { incrementWishlistCount } from "../../redux/wishlistSlice";
import { message } from "../../comman/toster-message/ToastContainer";
import * as localStorageService from "../../service/localStorageService";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
// Import dummy images from assets
import heroImage from "../../assets/heroImage.jpg";
import coupleHero from "../../assets/couple-hero1.jpg";
import familyHero from "../../assets/family-hero.jpg";
import kidsHero from "../../assets/kids-hero.png";
import petHero from "../../assets/pet-hero.png";
import womenImage from "../../assets/Women.png";
import menImage from "../../assets/Men.png";
import bathrobe from "../../assets/bathrobe.jpg";
import cushions from "../../assets/CUSHIONS.jpg";
import eyemasks from "../../assets/EYEMASKS.jpg";
import headband from "../../assets/HEADBAND.jpg";
import scrunchies from "../../assets/SCRUNCHIES.jpg";
import socks from "../../assets/SOCKS.jpg";
import towel from "../../assets/towel.jpg";
import herVideo from "../../assets/her.MP4";
import himVideo from "../../assets/him.MP4";

/**
 * Helper function for debouncing
 */
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/**
 * Product Card with Image Carousel Component
 */
const ProductCardWithCarousel = ({ product, gridClass, index, productImages, productPrice, onProductClick, onWishlistClick, wishlistItems, wishlistLoading }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto carousel on hover
  useEffect(() => {
    if (productImages.length <= 1 || !isHovered) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, productImages.length]);

  // Reset to first image when not hovered
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
    }
  }, [isHovered]);

  const currentImage = productImages[currentImageIndex] || productImages[0] || '';
  const hasMultipleImages = productImages.length > 1;

  return (
    <div
      className={`${gridClass} cursor-pointer group overflow-hidden bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300`}
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full aspect-square overflow-hidden bg-gray-100">
        {currentImage ? (
          <div className="relative w-full h-full">
            {productImages.map((img, imgIndex) => (
              <img
                key={imgIndex}
                src={img}
                alt={product.name || product.productName || 'Product'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ${
                  imgIndex === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } ${isHovered && hasMultipleImages ? 'scale-105' : 'scale-100'} transition-transform duration-500`}
                onError={(e) => {
                  // Only show placeholder if image fails, don't use dummy images
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Heart Icon - Top Right */}
        <button
          onClick={(e) => onWishlistClick(e, product)}
          disabled={wishlistLoading[product?.id]}
          className="absolute top-2 right-2 z-20 p-0 disabled:opacity-50"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
          aria-label={wishlistItems.has(product?.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlistLoading[product?.id] ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart
              size={18}
              strokeWidth={1.5}
              className={`transition-colors ${wishlistItems.has(product?.id) ? "text-black fill-black" : "text-black"}`}
            />
          )}
        </button>
        
        {/* Product Name and Price Overlay - Shows on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-2 px-4">
          <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-center">
            <p className="text-white text-sm md:text-base font-light mb-1 line-clamp-2 font-futura-pt-light">
              {product.name || product.productName || 'Product'}
            </p>
            {productPrice && (
              <p className="text-white text-lg md:text-xl font-light font-futura-pt-light">
                <span className="font-sans">{productPrice}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Gifts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [stickyTop, setStickyTop] = useState(120); // Initialize with default header height
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [openAccordion, setOpenAccordion] = useState("sortBy");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const stickyHeaderRef = React.useRef(null);
  const headerTriggerRef = React.useRef(null);
  const categoryDropdownRef = React.useRef(null);
  const categoryButtonRef2 = React.useRef(null);

  // Flag to toggle between dummy data and API - Set to true to use dummy data
  // Change to false when ready to use real API
  const USE_DUMMY_DATA = false;

  // Filter State
  const [filters, setFilters] = useState({
    segment: '',
    categories: [],
    subCategories: [],
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    country: 'IN',
    colors: [],
    sizes: [],
    fabric: [],
  });

  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [filterOptions, setFilterOptions] = useState({
    segments: ["Women", "Men", "Kids", "Pets", "Couple", "Family"],
    accessories: ["Scrunchies", "Socks", "Eyemasks", "Headband", "Cushions"],
    categories: [
      // { id: "Sleepwear", name: "Sleepwear" },
      // { id: "Loungewear", name: "Loungewear" },
      // { id: "Homewear", name: "Homewear" },
      { id: "Accessories", name: "Accessories" },
      { id: "PetWear", name: "Pet Wear" },
    ],
    subCategories: {
      sleepwear: [
        { id: "sleepwear-sets", name: "Sleepwear Sets" },
        { id: "nightgowns", name: "Nightgowns" },
        { id: "pajama-sets", name: "Pajama Sets" },
        { id: "robes", name: "Robes & Kaftans" },
      ],
      loungewear: [
        { id: "coord-sets", name: "Co-ord Sets" },
        { id: "lounge-pants", name: "Lounge Pants" },
        { id: "lounge-tops", name: "Lounge Tops" },
      ],
      homewear: [
        { id: "day-dresses", name: "Day Dresses" },
        { id: "casual-sets", name: "Casual Sets" },
      ],
      accessories: [
        { id: "slippers", name: "Slippers" },
        { id: "scrunchies", name: "Hair Scrunchies" },
        { id: "eye-masks", name: "Eye Masks" },
        { id: "pet-accessories", name: "Pet Accessories" },
      ],
      petwear: [
        { id: "pet-clothing", name: "Pet Clothing" },
        { id: "pet-sleepwear", name: "Pet Sleepwear" },
        { id: "pet-loungewear", name: "Pet Loungewear" },
      ],
    },
    sortOptions: [
      { id: "price_desc", name: "Highest to Lowest" },
      { id: "price_asc", name: "Lowest to Highest" },
      { id: "novelty", name: "Novelty" },
    ],
    fabricOptions: [
      { id: "cotton", name: "Premium Cotton" },
      { id: "satin", name: "Luxury Satin" },
      { id: "silk", name: "Pure Mulberry Silk" },
      { id: "modal", name: "Soft Modal Blend" },
      { id: "viscose", name: "Breathable Viscose" },
      { id: "rayon", name: "Lightweight Rayon" },
      { id: "linen", name: "Cool Linen" },
      { id: "jersey", name: "Stretch Jersey Knit" },
      { id: "bamboo", name: "Eco-Friendly Bamboo Fabric" },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [],
  });
  
  // Category mapping
  const categoryMap = {
    'Gift_For_Her': { name: 'Gifts for Her', segment: 'Gift_For_Her', bannerImage: null },
    'Gift_For_Him': { name: 'Gifts for Him', segment: 'Gift_For_Him', bannerImage: null },
    'Gift_For_Family': { name: 'Gifts for Family', segment: 'Gift_For_Family', bannerImage: null },
    'Gift_For_Kids': { name: 'Gifts for Kids', segment: 'Gift_For_Kids', bannerImage: null },
    'Gift_For_Pets': { name: 'Gifts for Pets', segment: 'Gift_For_Pets', bannerImage: null },
    'all': { name: 'All Gifts', segment: 'all', bannerImage: null },
  };

  const currentCategory = categoryParam ? categoryMap[categoryParam] : categoryMap['Gift_For_Her'];
  const categorySegment = currentCategory?.segment || 'Women';

  // Dummy images array for products - memoized to prevent recreation
  const dummyProductImages = useMemo(() => [
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
  ], []);

  // Create dummy products matching API response structure
  const createDummyProducts = useCallback(() => {
    const dummyProducts = [];
    const productNames = [
      'Luxury Silk Nightgown',
      'Premium Cotton Pajama Set',
      'Elegant Satin Robe',
      'Comfortable Lounge Set',
      'Soft Modal Sleepwear',
      'Classic Linen Nightdress',
      'Cozy Fleece Pajamas',
      'Designer Silk Kaftan',
      'Breathable Viscose Set',
      'Luxury Bamboo Nightwear',
      'Elegant Satin Dress',
      'Premium Cotton Robe',
      'Comfortable Modal Set',
      'Soft Silk Pajamas',
      'Classic Linen Gown',
      'Cozy Cotton Nightwear'
    ];
    const colors = ['Black', 'White', 'Navy', 'Beige', 'Pink', 'Gray', 'Ivory', 'Rose'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const fabrics = ['Silk', 'Cotton', 'Satin', 'Modal', 'Linen', 'Viscose'];

    for (let i = 0; i < 16; i++) {
      const imageIndex = i % dummyProductImages.length;
      const selectedColors = [colors[i % colors.length], colors[(i + 1) % colors.length]];
      const selectedSizes = sizes.slice(0, 4);
      const selectedFabric = fabrics[i % fabrics.length];

      dummyProducts.push({
        id: `dummy-product-${i + 1}`,
        productId: `PROD-${String(i + 1).padStart(4, '0')}`,
        name: productNames[i],
        productName: productNames[i],
        images: [
          {
            url: dummyProductImages[imageIndex],
            thumbnailUrl: dummyProductImages[imageIndex]
          }
        ],
        image: dummyProductImages[imageIndex],
        availableColors: selectedColors,
        availableSizes: selectedSizes,
        priceList: [
          {
            country: 'IN',
            size: selectedSizes[0],
            priceAmount: Math.floor(Math.random() * 5000) + 1000,
            currency: 'INR'
          },
          {
            country: 'IN',
            size: selectedSizes[1],
            priceAmount: Math.floor(Math.random() * 5000) + 1000,
            currency: 'INR'
          },
          {
            country: 'AE',
            size: selectedSizes[0],
            priceAmount: Math.floor(Math.random() * 150) + 50,
            currency: 'USD'
          }
        ],
        price: Math.floor(Math.random() * 5000) + 1000,
        category: 'Sleepwear',
        productMainCategory: 'Women',
        available: true,
        fabric: selectedFabric,
        description: `Premium ${selectedFabric.toLowerCase()} ${productNames[i].toLowerCase()} for ultimate comfort and style.`
      });
    }

    return dummyProducts;
  }, [dummyProductImages]);

  // Extract unique colors and sizes from products using useMemo to prevent unnecessary recalculations
  const extractedColorsAndSizes = useMemo(() => {
    if (products.length === 0) {
      return { colors: [], sizes: [] };
    }

    const allColors = new Set();
    const allSizes = new Set();

    products.forEach((product) => {
      // Extract colors
      if (Array.isArray(product.availableColors)) {
        product.availableColors.forEach((color) => {
          if (color && color.trim()) {
            allColors.add(color.trim());
          }
        });
      }
      // Extract sizes and split combined sizes like "M/L" into individual sizes
      if (Array.isArray(product.availableSizes)) {
        product.availableSizes.forEach((size) => {
          if (size && size.trim()) {
            // Split sizes that are combined with "/" (e.g., "M/L" -> "M", "L")
            const sizesSplit = size.trim().split('/').map(s => s.trim());
            sizesSplit.forEach(s => {
              if (s) allSizes.add(s);
            });
          }
        });
      }
    });

    // Convert to arrays and sort
    const uniqueColors = Array.from(allColors).sort();
    const uniqueSizes = Array.from(allSizes).sort((a, b) => {
      // Sort sizes: XS, S, M, L, XL, XXL, etc.
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const aIndex = sizeOrder.indexOf(a.toUpperCase());
      const bIndex = sizeOrder.indexOf(b.toUpperCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    return { colors: uniqueColors, sizes: uniqueSizes };
  }, [products]);

  // Update filterOptions only when colors/sizes actually change to prevent infinite loops
  const prevColorsSizesRef = useRef({ colors: [], sizes: [] });
  useEffect(() => {
    const prevColors = prevColorsSizesRef.current.colors;
    const prevSizes = prevColorsSizesRef.current.sizes;
    const newColors = extractedColorsAndSizes.colors;
    const newSizes = extractedColorsAndSizes.sizes;

    // Check if colors or sizes have actually changed
    const colorsChanged = prevColors.length !== newColors.length ||
      JSON.stringify(prevColors) !== JSON.stringify(newColors);
    const sizesChanged = prevSizes.length !== newSizes.length ||
      JSON.stringify(prevSizes) !== JSON.stringify(newSizes);

    if (colorsChanged || sizesChanged) {
      setFilterOptions((prev) => ({
        ...prev,
        colors: newColors,
        sizes: newSizes,
      }));
      // Update ref with new values
      prevColorsSizesRef.current = { colors: [...newColors], sizes: [...newSizes] };
    }
  }, [extractedColorsAndSizes]);

  // Ref to track previous filter values to prevent infinite loops
  const prevFiltersRef = useRef({});
  const prevCategoryRef = useRef('');

  // Debounced price range update
  useEffect(() => {
    const debouncedFilterUpdate = debounce(() => {
      setFilters(prev => ({
        ...prev,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      }));
    }, 600);

    debouncedFilterUpdate();
  }, [priceRange]);

  // Check wishlist on mount and when products change
  useEffect(() => {
    let isMounted = true;
    const checkWishlist = async () => {
      try {
        const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
        if (token && products.length > 0) {
          // Use cached wishlist to prevent multiple API calls
          const response = await getCachedWishlist(getWishlist);
          if (isMounted && response && response.data) {
            const wishlistItems = response.data;
            const wishlistProductIds = new Set();
            wishlistItems.forEach((item) => {
              // Extract product ID from wishlist item
              const productId = item.product?.id || item.product?.productId;
              if (productId) {
                wishlistProductIds.add(productId);
              }
            });
            setWishlistItems(wishlistProductIds);
          }
        }
      } catch (error) {
        // Silently fail if user is not authenticated or wishlist check fails
        if (isMounted) {
          console.error("Error checking wishlist:", error);
        }
      }
    };
    
    // Only check if products array has items and is stable (not empty)
    if (products.length > 0) {
      checkWishlist();
    }
    
    return () => {
      isMounted = false;
    };
  }, [products.length]); // Only depend on products.length to prevent unnecessary re-renders

  // Fetch products when category or filters change
  useEffect(() => {
    if (!categorySegment) return;
    
    // Create stable string representations of arrays for comparison (sort copies to avoid mutation)
    const colorsStr = JSON.stringify([...filters.colors].sort());
    const sizesStr = JSON.stringify([...filters.sizes].sort());
    const fabricStr = JSON.stringify([...filters.fabric].sort());
    
    // Create a key to compare if anything actually changed
    const currentFilterKey = `${categorySegment}-${filters.minPrice}-${filters.maxPrice}-${filters.sortBy}-${colorsStr}-${sizesStr}-${fabricStr}`;
    const prevFilterKey = prevFiltersRef.current.key;
    
    // Only fetch if filters actually changed
    if (currentFilterKey === prevFilterKey && prevCategoryRef.current === categorySegment) {
      return;
    }
    
    // Update refs
    prevFiltersRef.current = { key: currentFilterKey };
    prevCategoryRef.current = categorySegment;
    
    const fetchProducts = async () => {
    setIsLoading(true);
    try {
        // Use dummy data if flag is set to true
        if (USE_DUMMY_DATA) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const dummyProducts = createDummyProducts();
          setProducts(dummyProducts);
          setIsLoading(false);
          return;
        }

        // API call
        const payload = {
          q: '',
          category: categorySegment,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          pageNumber: null,
          pageSize: 100,
          sort: filters.sortBy || undefined,
          country: null,
          colors: filters.colors.length > 0 ? filters.colors : undefined,
          sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
          fabric: filters.fabric.length > 0 ? filters.fabric : undefined,
        };

        // Remove undefined values
        Object.keys(payload).forEach(key =>
          payload[key] === undefined && delete payload[key]
        );

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
    };

    fetchProducts();
  }, [
    categorySegment, 
    filters.minPrice, 
    filters.maxPrice, 
    filters.sortBy, 
    filters.colors, 
    filters.sizes, 
    filters.fabric,
    USE_DUMMY_DATA,
    createDummyProducts
  ]);

  // Handle filter changes - memoized to prevent unnecessary re-renders
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilterArray = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const toggleCategory = useCallback((categoryId) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
  }, []);

  const toggleColor = useCallback((color) => {
    setFilters(prev => {
      const newColors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors: newColors };
    });
  }, []);

  const toggleSize = useCallback((size) => {
    setFilters(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  }, []);

  const clearAllFilters = () => {
    setFilters({
      segment: '',
      categories: [],
      subCategories: [],
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      country: 'IN',
      colors: [],
      sizes: [],
      fabric: []
    });
    setPriceRange({ min: 0, max: 500000 });
  };

  const hasActiveFilters =
    filters.segment !== '' ||
    filters.categories.length > 0 ||
    filters.subCategories.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.sortBy !== '' ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.fabric.length > 0;

  // Get category name helper
  const getCategoryName = (id) => {
    return filterOptions.categories.find(cat => cat.id === id)?.name || id;
  };

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

  // Toggle accordion - memoized to prevent unnecessary re-renders
  const toggleAccordion = useCallback((name) => {
    setOpenAccordion(prev => prev === name ? null : name);
  }, []);

  // Memoized callbacks for accordion toggles to prevent re-renders
  const toggleSortBy = useCallback(() => toggleAccordion("sortBy"), [toggleAccordion]);
  const toggleGender = useCallback(() => toggleAccordion("gender"), [toggleAccordion]);
  const toggleAccessories = useCallback(() => toggleAccordion("accessories"), [toggleAccordion]);
  const toggleFabric = useCallback(() => toggleAccordion("fabric"), [toggleAccordion]);
  const toggleColors = useCallback(() => toggleAccordion("colors"), [toggleAccordion]);
  const toggleSizes = useCallback(() => toggleAccordion("sizes"), [toggleAccordion]);

  // Handle sticky header on scroll - stick when it reaches just below main website header
  useEffect(() => {
    const handleScroll = () => {
      if (headerTriggerRef.current && stickyHeaderRef.current) {
        // Get the main website header - it has z-[1200] class
        const mainHeader = document.querySelector('header[class*="z-"]') || 
                          document.querySelector('header');
        
        let mainHeaderHeight = 0;
        if (mainHeader) {
          // Get the full height of the header including top banner
          const headerRect = mainHeader.getBoundingClientRect();
          // Use the height directly - this gives us the total height of the header
          mainHeaderHeight = headerRect.height;
        }
        
        // If header not found, try to calculate from scroll position
        if (mainHeaderHeight === 0) {
          // Fallback: look for any fixed/sticky header at the top
          const allHeaders = document.querySelectorAll('header, [class*="header"], [class*="Header"]');
          for (let header of allHeaders) {
            const rect = header.getBoundingClientRect();
            if (rect.top === 0 || rect.top < 10) {
              mainHeaderHeight = rect.height;
              break;
            }
          }
        }
        
        // Final fallback
        if (mainHeaderHeight === 0) {
          mainHeaderHeight = 120;
        }
        
        const triggerRect = headerTriggerRef.current.getBoundingClientRect();
        
        // Always set the top value to main header height (no gap - flush against main header)
        // This ensures the sticky header positions just below the main header
        if (mainHeaderHeight > 0) {
          setStickyTop(mainHeaderHeight);
        }
        
        // Calculate when the sticky header should show shadow (visual feedback)
        // It should show shadow when the hero section bottom has scrolled past the main header
        const heroBottom = triggerRect.bottom;
        const shouldBeSticky = heroBottom <= mainHeaderHeight;
        
        // Track if it should show sticky styling (for shadow)
        setIsSticky(shouldBeSticky);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target) &&
        categoryButtonRef2.current &&
        !categoryButtonRef2.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Handle category selection
  const handleCategorySelect = (categoryKey) => {
    navigate(`/gifts?category=${categoryKey}`);
    setShowCategoryDropdown(false);
  };

  // Get product images array - handles multiple formats
  const getProductImages = (product) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      // Map images to extract URLs - handles both string URLs and objects
      return product.images.map(img => {
        if (typeof img === 'string') {
          return img;
        }
        if (typeof img === 'object') {
          return img.url || img.thumbnailUrl || '';
        }
        return '';
      }).filter(url => url); // Remove empty strings
    }
    // Fallback to other image properties
    const fallbackImage = product?.thumbnailUrl || product?.image || '';
    return fallbackImage ? [fallbackImage] : [];
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

  // Handle wishlist click
  const handleWishlistClick = async (e, product) => {
    e.stopPropagation();
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);

    if (!token) {
      // Save pending wishlist action before redirecting to login
      const payload = {
        productId: product.productId || productId,
        size: product.availableSizes?.[0] || '',
        desiredQuantity: 1,
        desiredSize: product.availableSizes?.[0] || '',
        desiredColor: product.availableColors?.[0] || '',
        notifyWhenBackInStock: false,
      };
      
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

    // Use product.id (from API) or fallback to productId
    const productId = product?.id || product?.productId;
    if (!productId || wishlistLoading[productId]) {
      return;
    }

    try {
      setWishlistLoading(prev => ({ ...prev, [productId]: true }));
      
      // Prepare payload - works with both dummy and real API products
      // API products have: id, productId, availableSizes, availableColors
      const payload = {
        productId: product.productId || productId, // Use productId field from API, fallback to id
        size: product.availableSizes?.[0] || '', // Safe access with optional chaining
        desiredQuantity: 1,
        desiredSize: product.availableSizes?.[0] || '',
        desiredColor: product.availableColors?.[0] || '', // Safe access with optional chaining
        notifyWhenBackInStock: false,
      };

      // Use product.id for the API call (this is the product object ID)
      await addToWishlist(productId, payload);
      // Invalidate cache so next check will fetch fresh data
      invalidateWishlistCache();
      setWishlistItems(prev => new Set([...prev, productId]));
      dispatch(incrementWishlistCount());
      message.success("Added to wishlist");
    } catch (error) {
      // If 401 error, save pending action and let interceptor handle redirect
      if (error?.response?.status === 401) {
        const payload = {
          productId: product.productId || productId,
          size: product.availableSizes?.[0] || '',
          desiredQuantity: 1,
          desiredSize: product.availableSizes?.[0] || '',
          desiredColor: product.availableColors?.[0] || '',
          notifyWhenBackInStock: false,
        };
        
        const pendingWishlistAction = {
          productId: productId,
          payload: payload,
          timestamp: Date.now()
        };
        
        localStorageService.setValue("pendingWishlistAction", JSON.stringify(pendingWishlistAction));
      }
      console.error("Failed to add to wishlist:", error);
      message.error("Unable to add to wishlist right now.");
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };


  // Get banner image - use first product image or fallback to category-specific dummy image
  const getBannerImage = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      const productImgs = getProductImages(firstProduct);
      if (productImgs.length > 0) return productImgs[0];
    }
    // Fallback to category-specific dummy images
    const bannerMap = {
      'Women': heroImage,
      'Men': menImage,
      'Family': familyHero,
      'Kids': kidsHero,
      'PetWear': petHero,
      'all': heroImage,
    };
    return bannerMap[categorySegment] || heroImage;
  };

  // Get banner media (video or image)
  const getBannerMedia = () => {
    const mediaMap = {
      'Gift_For_Her': { type: 'video', src: herVideo },
      'Gift_For_Him': { type: 'video', src: himVideo },
    };
    return mediaMap[categoryParam] || { type: 'image', src: getBannerImage() };
  };

  // Accordion Component - Minimal Gucci-style (memoized to prevent unnecessary re-renders)
  const FilterAccordion = memo(({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-text-light/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-6 hover:bg-black/[0.02] transition-colors duration-200"
      >
        <span className="text-black text-sm font-light font-futura-pt-book">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="text-black" strokeWidth={1.5} />
        ) : (
          <ChevronDown size={16} className="text-gray-600" strokeWidth={1.5} />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  ));

  // Filter Sidebar Component
  const FilterSidebar = ({ showHeader = true }) => (
    <div className="bg-white overflow-hidden">
      {showHeader && (
        <div className="px-6 py-5 border-b border-text-light/10 flex items-center justify-between">
          <h2 className="text-black text-sm font-light font-futura-pt-book">
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-black hover:text-gray-600 font-light underline transition-colors font-futura-pt-light"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Sort By */}
      <FilterAccordion
        title="Sort By"
        isOpen={openAccordion === "sortBy"}
        onToggle={toggleSortBy}
      >
        <div className="space-y-3">
          {filterOptions.sortOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="sortBy"
                checked={filters.sortBy === option.id}
                onChange={() => updateFilter('sortBy', option.id)}
                className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
              />
              <span className={`ml-3 text-sm transition-colors font-light font-futura-pt-light ${filters.sortBy === option.id
                ? "text-black"
                : "text-gray-600 group-hover:text-black"
                }`}>
                {option.name}
              </span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* Gender & Type */}
      <FilterAccordion
        title="Categories"
        isOpen={openAccordion === "gender"}
        onToggle={toggleGender}
      >
        <div className="space-y-3">
          {filterOptions.segments.map((segment) => (
            <label
              key={segment}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="segment"
                checked={filters.segment === segment}
                onChange={() => updateFilter('segment', segment)}
                className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
              />
              <span className={`ml-3 text-sm transition-colors font-light font-futura-pt-light ${filters.segment === segment
                ? "text-black"
                : "text-gray-600 group-hover:text-black"
                }`}>
                {segment}
              </span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* Accessories Filter */}
      <FilterAccordion
        title="Accessories"
        isOpen={openAccordion === "accessories"}
        onToggle={toggleAccessories}
      >
        <div className="space-y-3">
          {filterOptions.accessories.map((accessory) => (
            <label
              key={accessory}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="accessory"
                checked={filters.segment === accessory}
                onChange={() => updateFilter('segment', accessory)}
                className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
              />
              <span className={`ml-3 text-sm transition-colors font-light font-futura-pt-light ${filters.segment === accessory
                ? "text-black"
                : "text-gray-600 group-hover:text-black"
                }`}>
                {accessory}
              </span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title="Fabric Type"
        isOpen={openAccordion === "fabric"}
        onToggle={toggleFabric}
      >
        <div className="space-y-3">
          {filterOptions.fabricOptions.map((fabric) => (
            <label
              key={fabric.id}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                name="fabric"
                checked={filters.fabric.includes(fabric.id)}
                onChange={() => updateFilterArray("fabric", fabric.id)}
                className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
              />
              <span
                className={`ml-3 text-sm transition-colors font-light font-futura-pt-light ${filters.fabric.includes(fabric.id)
                  ? "text-black"
                  : "text-gray-600 group-hover:text-black"
                  }`}
              >
                {fabric.name}
              </span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* Colors Filter */}
      {filterOptions.colors.length > 0 && (
        <FilterAccordion
          title="Colors"
          isOpen={openAccordion === "colors"}
          onToggle={toggleColors}
        >
          <div className="space-y-3">
            {filterOptions.colors.map((color) => {
              const displayHex = getColorHex(color);

              return (
                <label
                  key={color}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleColor(color)}
                    className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
                  />
                  <div className="ml-3 flex items-center gap-3 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 ${isLightColor(displayHex)
                          ? 'border-2 border-gray-400'
                          : 'border border-gray-300'
                        }`}
                      style={{ backgroundColor: displayHex }}
                      title={color}
                    />
                    <span
                      className={`text-sm transition-colors font-light font-futura-pt-light flex-1 ${filters.colors.includes(color)
                        ? "text-black"
                        : "text-gray-600 group-hover:text-black"
                        }`}
                    >
                      {color}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* Sizes Filter */}
      {filterOptions.sizes.length > 0 && (
        <FilterAccordion
          title="Sizes"
          isOpen={openAccordion === "sizes"}
          onToggle={toggleSizes}
        >
          <div className="space-y-3">
            {filterOptions.sizes.map((size) => (
              <label
                key={size}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer"
                />
                <span
                  className={`ml-3 text-sm transition-colors font-light font-futura-pt-light ${filters.sizes.includes(size)
                    ? "text-black"
                    : "text-gray-600 group-hover:text-black"
                    }`}
                >
                  {size}
                </span>
              </label>
            ))}
          </div>
        </FilterAccordion>
      )}
    </div>
  );

  // Determine grid layout pattern based on wireframe design
  // Pattern repeats every 4 rows (16 items total):
  // Row 1: 4 singles (indices 0-3)
  // Row 2: 2 singles + 1 double spanning columns 3-4 (indices 4-6, where 6 is double)
  // Row 3: 4 singles (indices 7-10)
  // Row 4: 1 double spanning columns 1-2 + 2 singles (indices 11-13, where 11 is double)
  // Then pattern repeats
  const getGridLayout = (index) => {
    // Calculate position in the repeating 16-item block (4 rows of 4 columns)
    const positionInBlock = index % 16;
    
    // Row 1 in block (0-3): all singles - 4 equal squares
    if (positionInBlock < 4) {
      return 'col-span-1';
    }
    
    // Row 2 in block (4-6): first 2 singles, then 1 double spanning columns 3-4
    if (positionInBlock < 7) {
      if (positionInBlock === 6) {
        return 'col-span-2';
      }
      return 'col-span-1';
    }
    
    // Row 3 in block (7-10): all singles - 4 equal squares
    if (positionInBlock < 11) {
      return 'col-span-1';
    }
    
    // Row 4 in block (11-13): first is double spanning columns 1-2, rest are singles
    if (positionInBlock < 14) {
      if (positionInBlock === 11) {
        return 'col-span-2';
      }
      return 'col-span-1';
    }
    
    // Positions 14-15: should be singles (completing row 4 if needed, but pattern should repeat)
    // Default to single
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
      {/* Header Above Hero Section - Without Filters */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 text-black text-sm sm:text-sm md:text-sm font-light font-futura-pt-light">
                <span>{currentCategory?.name}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 font-light">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Hero Banner Image - Full Width */}
      <div ref={headerTriggerRef} className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] mb-0 overflow-hidden bg-gray-100">
          {getBannerMedia().type === 'video' ? (
            <video
              src={getBannerMedia().src}
              alt={currentCategory.name}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={getBannerMedia().src}
              alt={currentCategory.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

      {/* Category and Filter Bar - Below Hero Image (Sticky on Scroll) - Full Width */}
        <div 
          ref={stickyHeaderRef}
          className="sticky z-50 bg-white border-b border-gray-200 mb-6 transition-shadow duration-200"
          style={{ 
            top: `${stickyTop}px`,
            boxShadow: isSticky ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4 relative">
              <div className="relative">
                <button
                  ref={categoryButtonRef2}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-1 sm:gap-2 text-black hover:text-gray-600 transition-colors text-sm sm:text-sm md:text-sm font-light font-futura-pt-light"
                >
                  <span>{currentCategory.name}</span>
                  <ChevronDown size={14} className={`sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                </button>
                {showCategoryDropdown && (
                  <div
                    ref={categoryDropdownRef}
                    className="absolute top-full left-0 mt-1 sm:mt-2 bg-white border border-gray-200 shadow-lg z-50 min-w-[160px] sm:min-w-[200px]"
                  >
                    {Object.keys(categoryMap).map((categoryKey) => {
                      const category = categoryMap[categoryKey];
                      const isActive = currentCategory.segment === category.segment;
                      return (
                        <button
                          key={categoryKey}
                          onClick={() => handleCategorySelect(categoryKey)}
                          className={`w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-light transition-colors font-futura-pt-light ${
                            isActive
                              ? 'text-black font-futura-pt-book border-l-2 border-black'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 font-light">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 text-black hover:text-gray-600 transition-colors text-xs sm:text-sm font-light font-futura-pt-light"
              >
                <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {filters.sortBy !== '' && (
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs font-light font-futura-pt-light">
                <span>Sort: {filterOptions.sortOptions.find(opt => opt.id === filters.sortBy)?.name || ''}</span>
                <button
                  onClick={() => updateFilter('sortBy', '')}
                  className="hover:bg-white/20 transition-colors"
                  aria-label="Remove sort filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {filters.segment !== '' && (
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs font-light font-futura-pt-light">
                <span>{filters.segment}</span>
                <button
                  onClick={() => updateFilter('segment', '')}
                  className="hover:bg-white/20 transition-colors"
                  aria-label="Remove segment filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {filters.categories.map((catId) => (
              <div key={catId} className="inline-flex items-center gap-2 border border-gray-300 text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
                <span>{getCategoryName(catId)}</span>
                <button
                  onClick={() => toggleCategory(catId)}
                  className="hover:bg-black/5 transition-colors"
                  aria-label={`Remove ${getCategoryName(catId)} filter`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {filters.colors.map((color) => {
              const displayHex = getColorHex(color);

              return (
                <div key={color} className="inline-flex items-center gap-2 border border-gray-300 text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: displayHex }}
                  />
                  <span>{color}</span>
                  <button
                    onClick={() => toggleColor(color)}
                    className="hover:bg-black/5 transition-colors"
                    aria-label={`Remove ${color} filter`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {filters.sizes.map((size) => (
              <div key={size} className="inline-flex items-center gap-2 border border-gray-300 text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
                <span>Size: {size}</span>
                <button
                  onClick={() => toggleSize(size)}
                  className="hover:bg-black/5 transition-colors"
                  aria-label={`Remove ${size} filter`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {filters.fabric.map((fabricId) => {
              const fabricName = filterOptions.fabricOptions.find(f => f.id === fabricId)?.name || fabricId;
              return (
                <div key={fabricId} className="inline-flex items-center gap-2 border border-gray-300 text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
                  <span>{fabricName}</span>
                  <button
                    onClick={() => updateFilterArray("fabric", fabricId)}
                    className="hover:bg-black/5 transition-colors"
                    aria-label={`Remove ${fabricName} filter`}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={clearAllFilters}
              className="text-xs text-black hover:text-gray-600 font-light underline font-futura-pt-light"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Products Grid - Wireframe Layout - Full Width */}
        {products.length > 0 ? (
          <div className="grid grid-cols-4 gap-0 mb-12">
            {products.map((product, index) => {
              const gridClass = getGridLayout(index);
              const productImages = getProductImages(product);
              const productPrice = formatPrice(product);

              return (
                <ProductCardWithCarousel
                  key={product.id || index}
                  product={product}
                  gridClass={gridClass}
                  index={index}
                  productImages={productImages}
                  productPrice={productPrice}
                  onProductClick={handleProductClick}
                  onWishlistClick={handleWishlistClick}
                  wishlistItems={wishlistItems}
                  wishlistLoading={wishlistLoading}
                />
              );
            })}
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <p className="text-gray-600 text-sm font-light">No products found for this category.</p>
          </div>
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
                  <h2 className="font-light text-black text-sm font-futura-pt-book">
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
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearAllFilters();
                    }}
                    className="mt-3 text-xs text-black hover:text-gray-600 font-light underline font-futura-pt-light"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar showHeader={false} />
            </div>
          </div>
        )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Gifts;

