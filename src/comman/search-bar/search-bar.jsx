import React, { useState, useEffect, useRef, useCallback } from "react";
import { getFilteredProducts } from "../../service/productAPI";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";

const Searchbar = ({ onFocusChange }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popularSearches, setPopularSearches] = useState([]);

    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setFilteredProducts([]);
            setShowSuggestions(false);
            setIsFocused(false);
            if (onFocusChange) onFocusChange(false);
        }
    }, [onFocusChange]);

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocusChange) onFocusChange(true);
        if (filteredProducts.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay to allow clicking on suggestions
        setTimeout(() => {
            setIsFocused(false);
            if (onFocusChange) onFocusChange(false);
            setShowSuggestions(false);
        }, 150);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const payload = {
                q: "",
                category: "",
                subCategory: "",
                minPrice: null,
                maxPrice: null,
                pageNumber: null,
                pageSize: 500,
                sort: "latest",
                country: null,
            };
            const response = await getFilteredProducts(payload);
            if (response?.success && response.data) {
                const products = response.data.items || [];
                setProductData(products);
                generatePopularSearches(products);
            } else {
                setProductData([]);
                setPopularSearches([]);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProductData([]);
            setPopularSearches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const generatePopularSearches = (products) => {
        if (!products || products.length === 0) {
            setPopularSearches([]);
            return;
        }

        // Extract unique categories and subcategories
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const subCategories = [...new Set(products.map(p => p.subCategory).filter(Boolean))];

        // Get popular product names (first few words of most common product names)
        const productNames = products.map(p => p.name?.split(' ').slice(0, 2).join(' ')).filter(Boolean);
        const nameCounts = productNames.reduce((acc, name) => {
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        // Get top product name patterns
        const topProductNames = Object.entries(nameCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name]) => name);

        // Combine all sources and create dynamic suggestions
        const suggestions = [
            ...categories.slice(0, 3),
            ...subCategories.slice(0, 2),
            ...topProductNames
        ].filter(Boolean);

        // Remove duplicates and limit to 6 items
        const uniqueSuggestions = [...new Set(suggestions)].slice(0, 6);

        // Fallback to generic terms if no dynamic suggestions available
        const finalSuggestions = uniqueSuggestions.length > 0 ? uniqueSuggestions : [
            'Luxury Fashion',
            'Premium Collection',
            'Designer Wear',
            'Exclusive Items'
        ];

        setPopularSearches(finalSuggestions);
    };

    // Debounce helper
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const fetchSearchResults = useCallback(
        debounce(async (query) => {
            const trimmed = query.trim();
            if (!trimmed) {
                setFilteredProducts([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const payload = {
                    q: trimmed, 
                    category: "",
                    subCategory: "",
                    minPrice: null,
                    maxPrice: null,
                    pageNumber: 1,
                    pageSize: 20,
                    sort: "latest",
                    country: null,
                };

                const response = await getFilteredProducts(payload);
                const products = response?.data?.items || [];
                setFilteredProducts(products);
                setShowSuggestions(products.length > 0 && isFocused);
            } catch (err) {
                console.error("Search error:", err);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        }, 400),
        [isFocused]
    );

    const performSearch = (query) => {
        const input = query.toLowerCase().trim();
        if (!input) {
            setFilteredProducts([]);
            setShowSuggestions(false);
            return;
        }

        const keywords = input.split(/\s+/);
        const matches = productData.filter((product) => {
            const name = product.name?.toLowerCase() || "";
            const category = product.category?.toLowerCase() || "";
            const mainCat = product.productMainCategory?.toLowerCase() || "";

            return keywords.some(
                (kw) => name.includes(kw) || category.includes(kw) || mainCat.includes(kw)
            );
        });

        // Debug: Log first product to see available image fields
        if (matches.length > 0) {
            console.log("First product image fields:", {
                thumbnailUrl: matches[0].thumbnailUrl,
                imageUrl: matches[0].imageUrl,
                image: matches[0].image,
                productImages: matches[0].productImages,
                images: matches[0].images
            });
        }

        setFilteredProducts(matches);
        setShowSuggestions(matches.length > 0 && isFocused);
    };


    const debouncedSearch = debounce(performSearch, 300);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        fetchSearchResults(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const input = searchQuery.toLowerCase().trim();
        const keywords = input.split(/\s+/);
        const matches = productData.filter((product) => {
            const name = product.name?.toLowerCase() || "";
            const category = product.category?.toLowerCase() || "";
            const mainCat = product.productMainCategory?.toLowerCase() || "";

            return keywords.some(
                (kw) => name.includes(kw) || category.includes(kw) || mainCat.includes(kw)
            );
        });


        navigate("/products", { state: { products: matches } });

        setFilteredProducts([]);
        setSearchQuery("");
    };

    const handleProductClick = (product) => {
        setFilteredProducts([]);
        setSearchQuery("");
        setShowSuggestions(false);
        navigate("/products", { state: { product } });
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredProducts([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    useEffect(() => {
  
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [fetchProducts, handleClickOutside]);

    return (
        <div ref={dropdownRef} className="w-full max-w-lg mx-auto relative font-sans">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    {/* Search Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Search luxury products..."
                        className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 text-white placeholder-white/70 rounded-full shadow-lg border transition-all duration-300 text-sm sm:text-base md:text-lg ${isFocused
                                ? 'bg-white/30 border-white/50 shadow-xl'
                                : 'bg-white/20 border-white/30 hover:bg-white/25'
                            } focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50`}
                    />

                    {/* Search Icon */}
                    <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                        {loading ? (
                            <Loader2 size={16} className="sm:w-5 sm:h-5 text-white/70 animate-spin" />
                        ) : (
                            <Search
                                size={16}
                                className={`sm:w-5 sm:h-5 text-white/70 transition-all duration-300`}
                            />
                        )}
                    </div>

                    {/* Clear Button */}
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation z-10"
                        >
                            <X size={14} className="sm:w-4 sm:h-4 text-white/70 hover:text-white" />
                        </button>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2 rounded-full font-medium transition-all duration-300 touch-manipulation z-10 ${searchQuery
                                ? 'bg-white/30 text-white hover:bg-white/40 shadow-lg'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        <span className="hidden sm:inline text-sm md:text-base">Search</span>
                        <Search size={14} className="sm:hidden" />
                    </button>
                </div>
            </form>

            {/* Loading State */}
            {loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 rounded-lg p-2 sm:p-3 shadow-lg z-50">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                        <span className="text-xs sm:text-sm">Loading products...</span>
                    </div>
                </div>
            )}

            {/* Search Suggestions */}
            {showSuggestions && filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 rounded-lg shadow-xl border border-white/20 overflow-hidden z-50 animate-fade-in-up">
                    <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                        {filteredProducts.slice(0, 6).map((product, index) => (
                            <div
                                key={product._id}
                                onClick={() => handleProductClick(product)}
                                className="px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer text-gray-800 hover:bg-luxury-gold/10 hover:text-luxury-gold border-b border-gray-100 last:border-b-0 transition-all duration-200 flex items-center space-x-2 sm:space-x-3 touch-manipulation"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={product.thumbnailUrl || product.imageUrl || '/placeholder-product.jpg'}
                                        alt={product.name}
                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-product.jpg';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500 truncate hidden sm:block">{product.category}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <Search size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400" />
                                </div>
                            </div>
                        ))}

                        {filteredProducts.length > 6 && (
                            <div className="px-3 sm:px-4 py-2 text-center text-xs sm:text-sm text-gray-500 bg-gray-50/50">
                                +{filteredProducts.length - 6} more results
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && searchQuery && filteredProducts.length === 0 && showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 rounded-lg shadow-xl border border-white/20 p-3 sm:p-4 animate-fade-in-up z-50">
                    <div className="text-center text-gray-600">
                        <Search size={20} className="sm:w-6 sm:h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs sm:text-sm">No products found for "{searchQuery}"</p>
                        <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
                    </div>
                </div>
            )}

            {/* Dynamic Popular Searches */}
            {!searchQuery && isFocused && popularSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 rounded-lg shadow-xl border border-white/20 p-3 sm:p-4 animate-fade-in-up z-50">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Popular Searches</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {popularSearches.map((term, index) => (
                            <button
                                key={term}
                                onClick={() => {
                                    setSearchQuery(term);
                                    performSearch(term);
                                }}
                                className="px-2 sm:px-3 py-1 bg-luxury-gold/10 text-luxury-gold rounded-full text-xs hover:bg-luxury-gold/20 transition-colors touch-manipulation"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Searchbar;
