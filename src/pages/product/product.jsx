import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ProductCard from "../product/components/product-card";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { getFilteredProducts } from "../../service/productAPI";

/**
 * Helper function to format API response data
 * Handles null checks and provides fallbacks
 */
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};


const ProductsPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const savedCountry = localStorage.getItem('selectedCountry');
  const parsedCountry = JSON.parse(savedCountry);
  const [selectedCountry, setSelectedCountry] = useState(parsedCountry?.code || "IN");
  console.log(selectedCountry, "s")
  const navigate = useNavigate();
  const passedProducts = location.state?.products || [];
  console.log(passedProducts, "passed")

  // Get sort from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const urlSort = searchParams.get('sort');

  // UI State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("sortBy");

  // Filter State
  const [filters, setFilters] = useState({
    segment: '',
    categories: [],
    subCategories: [],
    minPrice: '',
    maxPrice: '',
    sortBy: urlSort || '',
    country: 'IN',
    colors: [],
    sizes: [],
    fabric: [],
  });
  console.log(filters, "filtersas")

  // API State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: '',
    pageSize: '12',
    total: '0',
  });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [filterOptions, setFilterOptions] = useState({
    segments: ["Women", "Men", "Kids", "Pets", "Couple", "Family", "Scrunchies", "Socks", "Eyemasks", "Headband", "Cushions"],
    categories: [
      { id: "Sleepwear", name: "Sleepwear" },
      { id: "Loungewear", name: "Loungewear" },
      { id: "Homewear", name: "Homewear" },
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
      { id: "Latest", name: "Novelty" },
    ],
    fabricOptions: [
      { id: "Cotton", name: "Cotton" },

      { id: "Silk", name: "Silk" },

    ],
    colors: [],
    sizes: [],
  });

  // Extract unique colors and sizes from products using useMemo to prevent unnecessary recalculations
  const extractedColorsAndSizes = useMemo(() => {
    const productsToExtract = products.length > 0 ? products : (passedProducts.length > 0 ? passedProducts : []);

    if (productsToExtract.length === 0) {
      return { colors: [], sizes: [] };
    }

    const allColors = new Set();
    const allSizes = new Set();

    productsToExtract.forEach((product) => {
      // Extract colors
      if (Array.isArray(product.availableColors)) {
        product.availableColors.forEach((color) => {
          if (color && color.trim()) {
            allColors.add(color.trim());
          }
        });
      }
      // Extract sizes
      if (Array.isArray(product.availableSizes)) {
        product.availableSizes.forEach((size) => {
          if (size && size.trim()) {
            allSizes.add(size.trim());
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
  }, [products, passedProducts]);

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


  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = {
        q: '',
        category:category,
        subCategory: filters.segment || "",
        // minPrice: filters.minPrice ?? null,
        // maxPrice: filters.maxPrice ?? null,
        pageNumber: 1,
        pageSize: 20,
        sort: filters.sortBy || "latest",
        country: selectedCountry,
        colors: filters.colors || [],
        sizes: filters.sizes || [],
        fabric: filters.fabric || []
      };


      // Remove undefined values
      Object.keys(payload).forEach(key =>
        payload[key] === undefined && delete payload[key]
      );

      const response = await getFilteredProducts(payload);

      if (response && response.success && response.data) {
        setProducts(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, filters.segment, filters.minPrice, filters.maxPrice, filters.sortBy, filters.colors, filters.sizes, pagination.pageSize, filters.fabric,]);

  useEffect(() => {
    if (passedProducts.length > 0) {
      setProducts(passedProducts);
    }
    else if (category == '' && passedProducts.length == 0) {
      setProducts([])
    }
  }, [passedProducts]);
  useEffect(() => {

    if (!location.state?.products) {
      fetchProducts();
    }

  }, [category, filters.categories, filters.sortBy, pagination.pageNumber, priceRange, filters.country, filters.subCategories, filters.segment, filters.colors, filters.sizes, filters.fabric, location.state?.products]);

  // Handle filter changes - memoized to prevent unnecessary re-renders
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);
  const updateFilterArray = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);


  const toggleCategory = useCallback((categoryId) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const toggleColor = useCallback((color) => {
    setFilters(prev => {
      const newColors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors: newColors };
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const toggleSize = useCallback((size) => {
    setFilters(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  }, []);

  const clearAllFilters = () => {
    setFilters({
      segment: '',
      categories: [],
      subCategories: [],
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      country: '',
      colors: [],
      sizes: [],
      fabric: []
    });
    // Clear the category from URL when clearing all filters
    navigate('/products', { replace: true });
  };

  const hasActiveFilters =
    (category && category !== '') ||
    filters.segment !== '' ||
    filters.categories.length > 0 ||
    filters.subCategories.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.sortBy !== '' ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0;

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
  const toggleFabric = useCallback(() => toggleAccordion("fabric"), [toggleAccordion]);
  const toggleColors = useCallback(() => toggleAccordion("colors"), [toggleAccordion]);
  const toggleSizes = useCallback(() => toggleAccordion("sizes"), [toggleAccordion]);

  // Accordion Component - Minimal Gucci-style (memoized to prevent unnecessary re-renders)
  const FilterAccordion = memo(({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-text-light/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-6 hover:bg-black/[0.02] transition-colors duration-200"
      >
        <span className="text-black text-md lg:text-md md:text-md sm:text-sm  font-light font-futura-pt-light">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="text-black" strokeWidth={1.5} />
        ) : (
          <ChevronDown size={16} className="text-text-medium" strokeWidth={1.5} />
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
          <h2 className="text-black text-md lg:text-md md:text-md sm:text-sm font-light font-futura-pt-light">
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-black hover:text-text-medium font-light text-md lg:text-md md:text-md sm:text-sm transition-colors font-futura-pt-light"
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
              <span className={`ml-3 text-sm tracking-wide transition-colors font-light font-futura-pt-light ${filters.sortBy === option.id
                ? "text-black"
                : "text-text-medium group-hover:text-black"
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
              <span className={`ml-3 text-sm tracking-wide transition-colors font-light font-futura-pt-light ${filters.segment === segment
                ? "text-black"
                : "text-text-medium group-hover:text-black"
                }`}>
                {segment}
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
                className={`ml-3 text-sm tracking-wide transition-colors font-light font-futura-pt-light ${filters.fabric.includes(fabric.id)
                  ? "text-black"
                  : "text-text-medium group-hover:text-black"
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
                      className={`text-sm tracking-wide transition-colors font-light font-futura-pt-light flex-1 ${filters.colors.includes(color)
                        ? "text-black"
                        : "text-text-medium group-hover:text-black"
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
                  className={`ml-3 text-sm tracking-wide transition-colors font-light font-futura-pt-light ${filters.sizes.includes(size)
                    ? "text-black"
                    : "text-text-medium group-hover:text-black"
                    }`}
                >
                  {size}
                </span>
              </label>
            ))}
          </div>
        </FilterAccordion>
      )}


      {/* Categories */}
      {/* <FilterAccordion
        title="Category"
        isOpen={openAccordion === "categories"}
        onToggle={() => toggleAccordion("categories")}
      >
        <div className="space-y-3">
          {filterOptions.categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="w-4 h-4 border border-text-light text-black focus:ring-1 focus:ring-black cursor-pointer rounded-none"
              />
              <span className={`ml-3 text-sm tracking-wide transition-colors ${filters.categories.includes(cat.id)
                ? "text-black font-light"
                : "text-text-medium group-hover:text-black"
                }`}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterAccordion> */}

      {/* <FilterAccordion
        title="Price Range"
        isOpen={openAccordion === "price"}
        onToggle={() => toggleAccordion("price")}
      >
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange.min}</span>
            <span>₹{priceRange.max}</span>
          </div>

          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({
                ...prev,
                min: Math.min(Number(e.target.value), prev.max - 1000),
              }))
            }
            className="w-full accent-black cursor-pointer"
          />

          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({
                ...prev,
                max: Math.max(Number(e.target.value), prev.min + 1000),
              }))
            }
            className="w-full accent-black cursor-pointer"
          />
        </div>
      </FilterAccordion> */}
      {/* <FilterAccordion
        title="Country"
        isOpen={openAccordion === "country"}
        onToggle={() => toggleAccordion("country")}
      >
        <div className="space-y-3 mt-2">
          {["IN", "SA", "AE"].map((code) => {
            const countryNames = { IN: "India", SA: "Saudi Arabia", AE: "UAE" };
            return (
              <label
                key={code}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="country"
                  checked={filters.country === code}
                  onChange={() => setFilters((prev) => ({ ...prev, country: code }))}
                  className="w-4 h-4 border border-gray-400 text-black focus:ring-1 focus:ring-black cursor-pointer"
                />
                <span
                  className={`ml-3 text-sm tracking-wide transition-colors ${filters.country === code
                      ? "text-black font-light"
                      : "text-gray-600 group-hover:text-black"
                    }`}
                >
                  {countryNames[code]}
                </span>
              </label>
            );
          })}
        </div>
      </FilterAccordion> */}



    </div>
  );

  return (
    <div
      className="min-h-screen bg-premium-cream"
    >
      {/* Filter Sidebar - Opens from left */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[1300]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          ></div>

          <div className="absolute left-0 top-0 bottom-0 w-80 md:w-96 bg-white shadow-2xl overflow-y-auto animate-slideInLeft">
            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-text-light/20">
              <div className="flex items-center justify-between">
                <h2 className=" text-md lg:text-md md:text-md sm:text-sm  text-black font-light font-futura-pt-light">
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-black hover:text-text-medium transition-colors"
                  aria-label="Close filters"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setShowMobileFilters(false);
                  }}
                  className="mt-3 text-md lg:text-md md:text-md sm:text-sm hover:text-text-medium font-light  font-futura-pt-light"
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterSidebar showHeader={false} />
          </div>
        </div>
      )}

      {/* Mobile Sort Modal - Bottom Sheet Style
      {showMobileSort && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileSort(false)}
          ></div>

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slideUp">
            <div className="px-6 py-5 border-b border-text-light/20">
              <div className="flex items-center justify-between">
                <h2 className="font-light text-black text-sm font-sweet-sans">
                  Sort By
                </h2>
                <button
                  onClick={() => setShowMobileSort(false)}
                  className="text-black hover:text-text-medium transition-colors"
                  aria-label="Close sort"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-1">
                {filterOptions.sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      updateFilter('sortBy', option.id);
                      setShowMobileSort(false);
                    }}
                    className={`w-full text-left py-4 px-0 text-sm font-light transition-colors ${filters.sortBy === option.id
                        ? 'text-black'
                        : 'text-text-medium hover:text-black'
                      }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-12">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black mb-2 font-futura-pt-book">
            {category
              ? `${category.replace(/([A-Z])/g, " $1").trim()} Collection`
              : "All Products"}
          </h1>
          <p className="text-gray-600 text-md md:text-md sm:text-sm font-light leading-relaxed font-futura-pt-light">
            Timeless essentials crafted for serene nights and refined comfort
          </p>
        </div>

        {/* Filter Button, Sorting & Product Count */}
        <div className="mb-8 pb-4 border-b border-text-light/20">
          {/* Desktop/Tablet Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 text-black hover:text-text-medium transition-colors group"
              >
                <SlidersHorizontal size={18} strokeWidth={1.5} />
                <span className=" text-lg lg:text-lg md:text-md sm:text-sm font-light border-b-2 border-black group-hover:border-text-medium transition-colors font-futura-pt-light">
                  Filters
                </span>
              </button>

              {/* Sorting Options - Desktop/Tablet */}
              {/* <div className="flex items-center gap-3">
                <span className="text-sm font-light text-black">Sort By:</span>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => updateFilter('sortBy', option.id)}
                      className={`px-3 py-1.5 text-xs transition-all duration-200 ${filters.sortBy === option.id
                          ? 'bg-black text-white'
                          : 'border border-text-light text-black hover:bg-black hover:text-white'
                        }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>

            <div className="text-text-medium text-sm  font-futura-pt-light">
              {products.length} Product{products.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-6">
            {/* Mobile Filter & Sort Buttons */}
            <div className="flex items-center gap-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 text-black hover:text-text-medium transition-colors group"
              >
                <SlidersHorizontal size={18} strokeWidth={1.5} />
                <span className="tex-black text-md lg:text-md md:text-md sm:text-sm font-light border-b-2 border-black group-hover:border-text-medium transition-colors font-futura-pt-light">
                  Filters
                </span>
              </button>

              {/* Mobile Sort Button */}
              {/* <button
                onClick={() => setShowMobileSort(true)}
                className="flex items-center gap-2 text-black hover:text-text-medium transition-colors group"
              >
                <span className="text-sm font-light text-black">
                  Sort by {filterOptions.sortOptions.find(opt => opt.id === filters.sortBy)?.name || 'Featured'}
                </span>
                <ChevronDown size={16} strokeWidth={1.5} />
              </button> */}
            </div>

            {/* Mobile Product Count - Centered */}
            <div className="text-center">
              <div className="text-text-medium text-sm  font-futura-pt-light">
                {products.length} Product{products.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {filters.sortBy !== '' && (
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs font-futura-pt-light">
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
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs  font-futura-pt-light">
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
              <div key={catId} className="inline-flex items-center gap-2 border border-text-light text-black px-3 py-1.5 text-xs  font-light font-futura-pt-light">
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
                <div key={color} className="inline-flex items-center gap-2 border border-text-light text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
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
              <div key={size} className="inline-flex items-center gap-2 border border-text-light text-black px-3 py-1.5 text-xs font-light font-futura-pt-light">
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

            <button
              onClick={clearAllFilters}
              className="text-sm text-black hover:text-text-medium font-light  font-futura-pt-light"
            >
              Clear All
            </button>
          </div>
        )}


        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-medium text-sm font-futura-pt-light">Loading...</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 border-2 border-text-light/20 flex items-center justify-center">
                <span className="text-4xl text-text-light">✕</span>
              </div>
              <h3 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black mb-2 font-futura-pt-book">
                No Products Found
              </h3>
              <p className="text-gray-600 text-md md:text-md sm:text-sm font-light leading-relaxed font-futura-pt-light mb-8">
                Try adjusting your filters to find what you're looking for
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="bg-black text-white px-8 py-3 font-light hover:bg-text-dark transition-colors text-sm font-futura-pt-light"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
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

export default ProductsPage;
