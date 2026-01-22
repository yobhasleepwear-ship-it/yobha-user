import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, ArrowRight, ShoppingBag, ShoppingCart, Bell } from "lucide-react";
import { getWishlist, removeFromWishlists } from "../../service/wishlist";
import { invalidateWishlistCache } from "../../service/wishlistCache";
import { addToCart, getProductDescription } from "../../service/productAPI";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../redux/cartSlice";
import { setWishlistCount, decrementWishlistCount } from "../../redux/wishlistSlice";
import { message } from "../../comman/toster-message/ToastContainer";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import * as localStorageService from "../../service/localStorageService";
import ProductCard from "../product/components/product-card";

export const countryOptions = [
  { code: "IN", label: "India", currency: "INR" },
  { code: "AE", label: "United Arab Emirates (UAE)", currency: "AED" },
  { code: "SA", label: "Saudi Arabia", currency: "SAR" },
  { code: "QA", label: "Qatar", currency: "QAR" },
  { code: "KW", label: "Kuwait", currency: "KWD" },
  { code: "OM", label: "Oman", currency: "OMR" },
  { code: "BH", label: "Bahrain", currency: "BHD" },
  { code: "JO", label: "Jordan", currency: "JOD" },
  { code: "LB", label: "Lebanon", currency: "LBP" },
  { code: "EG", label: "Egypt", currency: "EGP" },
  { code: "IQ", label: "Iraq", currency: "IQD" },
  { code: "RU", label: "Russia", currency: "RUB" },
  { code: "GB", label: "United Kingdom (UK)", currency: "GBP" },
  { code: "US", label: "United States (USA)", currency: "USD" },
];

const getCountryByCurrency = (currency) => {
  return countryOptions.find(
    (country) => country.currency.toUpperCase() === currency.toUpperCase()
  ).code;
};

// Transform wishlist item to product format for ProductCard
const transformWishlistItemToProduct = (wishlistItem) => {
  const product = wishlistItem?.product || {};

  // Get images - try different possible fields
  let images = [];
  if (product.images && Array.isArray(product.images)) {
    images = product.images.map(img => typeof img === 'string' ? img : (img.url || img.thumbnailUrl || ''));
  } else if (product.thumbnailUrl) {
    images = [product.thumbnailUrl];
  } else if (product.image) {
    images = [product.image];
  }

  // Get price list from product or construct from available data
  let priceList = product.priceList || [];
  if (!priceList.length && product.unitPrice) {
    // Construct a basic price list entry
    const savedCountry = localStorage.getItem('selectedCountry');
    const parsedCountry = savedCountry ? JSON.parse(savedCountry) : { code: 'IN' };
    priceList = [{
      country: parsedCountry?.code || 'IN',
      size: wishlistItem.desiredSize || product.availableSizes?.[0] || '',
      priceAmount: product.unitPrice,
      currency: product.currency || 'INR'
    }];
  }

  return {
    id: product.productObjectId || product.id || wishlistItem.id,
    productId: product.productId || product.id,
    name: product.name || 'Untitled Product',
    price: product.unitPrice || product.price || 0,
    priceList: priceList,
    images: images.length > 0 ? images : [],
    available: product.available !== false,
    productMainCategory: product.productMainCategory || '',
    availableColors: product.availableColors || [],
    availableSizes: product.availableSizes || [],
    category: product.category || '',
    wishlistItemId: wishlistItem.id // Store original wishlist item ID for removal
  };
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // API State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentVisited, setRecentVisited] = useState([]);
  const [movingToCart, setMovingToCart] = useState({}); // Track which item is being moved

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
    return !!token;
  };

  // Load recently viewed products
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem("recentVisited")) || [];
      setRecentVisited(recent);
    } catch (err) {
      console.error("Error loading recently visited products:", err);
      setRecentVisited([]);
    }
  }, []);

  useEffect(() => {
    fetchWishList();

  }, []);

  const fetchWishList = async () => {
    // If user is not authenticated, show empty state without calling API
    // This prevents 401 error and interceptor redirect
    if (!isAuthenticated()) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true)
    try {
      const response = await getWishlist();
      console.log(response.data, "res")
      const items = response.data || [];
      setWishlistItems(items);
      // Update wishlist count in Redux
      dispatch(setWishlistCount(items.length));
    }
    catch (err) {
      // Handle errors - if 401, clear token and show empty state
      // This prevents interceptor from redirecting by clearing auth state
      if (err?.response?.status === 401) {
        // Clear invalid/expired token to prevent interceptor redirect
        localStorageService.removeKey(LocalStorageKeys.AuthToken);
        localStorageService.removeKey(LocalStorageKeys.RefreshToken);
        localStorageService.removeKey(LocalStorageKeys.User);
        setWishlistItems([]);
      } else {
        console.log("something went wrong", err)
        setError(err?.response?.data?.message || "Failed to load wishlist");
      }
    }
    finally {
      setIsLoading(false)
    }
  }
  // Remove from wishlist
  const removeFromWishlist = async (wishlistItemId, e) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const response = await removeFromWishlists(wishlistItemId);
      // Invalidate cache so other components get fresh data
      invalidateWishlistCache();
      await fetchWishList();
      message.success('Item removed from Wishlist!');
    } catch (err) {
      message.error("removeFromWishlist error:", err.response?.data || err.message);
      throw err;
    }
  };
  const handleLoginFromWishlist = () => {
    const currentPath = window.location.pathname + window.location.search;
    localStorageService.setValue("redirectAfterLogin", currentPath);

    navigate('/login')
  }
  // Move to cart
  const handleAddToCart = async (item, selectedSize, selectedCountry, quantity, selectedColor) => {
    const productDescription = await getProductDescription(item.product.productObjectId)
    const product = productDescription.data
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
        quantity: 1,
        note: "",
        monogram: "",
      };
    } else {

      cart.push({
        ...safeProduct,
        size: selectedSize,
        country: selectedCountry,
        quantity: 1,
        country: selectedCountry,
        monogram: "",
        color: selectedColor,
        note: "",
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // setCartItems(cart);
    dispatch(setCartCount(cart.length));
    message.success(`${safeProduct.name || "Product"} added to cart!`);
  };


  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-medium text-sm font-light font-futura-pt-light">Loading Wishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans"
      >
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 font-futura-pt-book">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 text-xs md:text-sm mb-8 font-light font-futura-pt-light">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 font-light hover:bg-text-dark transition-colors text-sm font-futura-pt-light"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-premium-cream font-futura-pt-light"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-12">

        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 font-futura-pt-book">
                My Wishlist
              </h1>
              <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-black hover:text-text-medium transition-colors border-b-2 border-black hover:border-text-medium text-sm font-light font-futura-pt-light"
              >
                Continue Shopping
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist */
          <>
            <div className="text-center py-12 md:py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 border-2 border-text-light/20 flex items-center justify-center">
                  <Heart size={40} className="text-text-light md:w-12 md:h-12" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 font-futura-pt-book">
                  Your Wishlist is Empty
                </h2>
                <p className="text-gray-600 text-xs md:text-sm mb-4 font-light leading-relaxed font-futura-pt-light">
                  Add your Favourite Picks and Share
                </p>
                <p className="text-gray-600 text-xs md:text-sm mb-6 font-light leading-relaxed font-futura-pt-light">
                  Need Ideas?
                </p>
                {!isAuthenticated() && (
                  <button
                    onClick={handleLoginFromWishlist}
                    className="inline-flex items-center gap-2 md:gap-3 bg-black text-white px-6 md:px-8 py-3 md:py-4 font-light hover:bg-text-dark transition-colors text-xs md:text-sm mb-8 rounded-3xl font-futura-pt-light"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Recently Viewed Products Section - Below Need Ideas */}
            {/* Shows for both authenticated and unauthenticated users */}
            {recentVisited.length > 0 && (
              <div className="mt-8 md:mt-10">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg sm:text-lg md:text-xl lg:text-xl font-light text-black mb-2 font-futura-pt-book text-center">
                    Recently Viewed
                  </h2>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                  {recentVisited.map((item) => {
                    const productImages = Array.isArray(item?.images) && item.images.length > 0
                      ? item.images
                      : item?.image ? [item.image] : [];

                    return (
                      <div
                        key={item.id}
                        className="group bg-white border border-text-light/20 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer"
                        onClick={() => {
                          try {
                            const existing = JSON.parse(localStorage.getItem("recentVisited")) || [];
                            const filtered = existing.filter((p) => p.id !== item.id);
                            const updated = [item, ...filtered];
                            const limited = updated.slice(0, 8);
                            localStorage.setItem("recentVisited", JSON.stringify(limited));
                          } catch (err) {
                            console.error("Error saving recent visited products:", err);
                          }
                          navigate(`/productDetail/${item.id}`);
                        }}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-premium-beige">
                          <img
                            src={productImages[0] || item.thumbnailUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='}
                            alt={item.name || item.title || 'Product'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-light text-black text-sm mb-2 line-clamp-2 font-futura-pt-light">
                            {item.name || item.title || 'Untitled Product'}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Wishlist Grid - Using ProductCard Style */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-4">
            {wishlistItems.map((item) => {
              const product = transformWishlistItemToProduct(item);
              const isMoving = movingToCart[item.id] || false;

              return (
                <div key={item.id} className="relative group/wishlist-item">
                  {/* ProductCard Component */}
                  <ProductCard product={product} />
                  <div className="absolute top-2 right-2 z-30 flex gap-2">
                    {/* Delete Button - Top Right Corner */}
                    <button
                      onClick={(e) => removeFromWishlist(item.id, e)}
                      className="p-1.5 bg-white/90 hover:bg-white text-black hover:text-red-500 transition-all duration-200 shadow-md hover:shadow-lg rounded-sm"
                      aria-label="Remove from wishlist"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(item, item.desiredSize, getCountryByCurrency(item.product.currency), item.quantity, item.desiredColor)}
                      className=" p-1.5 bg-white/90 hover:bg-white text-black hover:text-green-600 transition-all duration-200 shadow-md hover:shadow-lg rounded-sm"
                      aria-label="Add to cart"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ShoppingCart size={18} strokeWidth={1.5} />
                    </button>

                    {/* Notify Me Button - Bottom Left Corner */}
                    <button
                      // onClick={(e) => notifyMe(product, e)}
                      className="p-1.5 bg-white/90 hover:bg-white text-black hover:text-blue-600 transition-all duration-200 shadow-md hover:shadow-lg rounded-sm"
                      aria-label="Notify me"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Bell size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
