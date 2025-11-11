import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Bell } from "lucide-react";
import { getWishlist, removeFromWishlists } from "../../service/wishlist";
import { addToCart } from "../../service/productAPI";
import { message } from "../../comman/toster-message/ToastContainer";


const formatPrice = (price, currency = 'INR') => {
  if (typeof price !== 'number') return '₹0';
  const symbol = currency === 'INR' ? '₹' : currency;
  return `${symbol}${price.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};


const calculateDiscountPercent = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

const WishlistPage = () => {
  const navigate = useNavigate();

  // API State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchWishList();

  }, []);

  const fetchWishList = async () => {
    setIsLoading(true)
    try {
      const response = await getWishlist();
      console.log(response.data, "res")
      setWishlistItems(response.data)
    }
    catch (err) {
      console.log("something went wrong")
    }
    finally {
      setIsLoading(false)
    }
  }
  // Remove from wishlist

  const removeFromWishlist = async (productId) => {
    try {
      const response = await removeFromWishlists(productId)
      fetchWishList();
      message.success('Item removed from Wishlist!');
    } catch (err) {
      message.error("removeFromWishlist error:", err.response?.data || err.message);
      throw err;
    }
  };
  // Move to cart
  const moveToCart = async (item) => {

    const cartData = {
      productId: item.product.productId,
      variantSku: item.product.variantSku,
      quantity: item.desiredQuantity,
      size: item.desiredSize,
      color: item.desiredColor
    };
    try {
      await addToCart(cartData);



      removeFromWishlist(item.id);

      message.success('Item moved to cart!');
    }
    catch (err) {
      message.error("something went wrong")
      console.log(err || "something went wrong")
    }

  };

  // Toggle notify when back in stock
  const toggleNotification = (itemId) => {
    setWishlistItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, notifyWhenBackInStock: !item.notifyWhenBackInStock }
          : item
      )
    );
    // TODO: Call API to update notification preference
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-medium text-sm uppercase tracking-wider">Loading Wishlist...</p>
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
          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 uppercase font-futura-pt-light">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 text-xs md:text-sm mb-8 font-light font-futura-pt-light">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 font-light hover:bg-text-dark transition-colors uppercase tracking-wider text-sm"
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
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
                My Wishlist
              </h1>
              <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-black hover:text-text-medium transition-colors border-b-2 border-black hover:border-text-medium uppercase text-sm tracking-wider font-light"
              >
                Continue Shopping
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist */
          <div className="text-center py-12 md:py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 border-2 border-text-light/20 flex items-center justify-center">
                <Heart size={40} className="text-text-light md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 uppercase font-futura-pt-light">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 text-xs md:text-sm mb-6 md:mb-8 font-light leading-relaxed font-futura-pt-light">
                Save items you love for later
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 md:gap-3 bg-black text-white px-6 md:px-8 py-3 md:py-4 font-light hover:bg-text-dark transition-colors uppercase tracking-wider text-xs md:text-sm"
              >
                Explore Products
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item?.product || {};
              const discountPercent = calculateDiscountPercent(product.compareAtPrice, product.unitPrice);

              return (
                <div
                  key={item.id}
                  className="group bg-white border border-text-light/20 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Product Image */}
                  <div
                    className="relative aspect-square overflow-hidden bg-premium-beige cursor-pointer"
                    onClick={() => navigate(`/productDetail/${product.productObjectId}`)}
                  >
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-black hover:text-red-500 transition-all z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-3 left-3 bg-black text-white px-2.5 py-1 text-xs font-light uppercase tracking-wider">
                        {discountPercent}% OFF
                      </div>
                    )}

                    {/* Free Shipping Badge */}
                    {product.freeShipping && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-black px-2.5 py-1 text-xs font-light uppercase tracking-wider">
                        Free Shipping
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-light text-black text-base mb-2 line-clamp-2 hover:underline cursor-pointer uppercase tracking-tight"
                      onClick={() => navigate(`/productDetail/${product.productObjectId}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Variant Info */}
                    <div className="flex flex-wrap gap-2 text-xs text-text-medium mb-3">
                      {item.desiredColor && (
                        <span className="capitalize">Color: <span className="text-black font-light">{item.desiredColor}</span></span>
                      )}
                      {item.desiredSize && (
                        <span>Size: <span className="text-black font-light">{item.desiredSize}</span></span>
                      )}
                    </div>

                    {/* Note */}
                    {item.note && (
                      <p className="text-xs text-text-light italic mb-3 line-clamp-1">
                        Note: {item.note}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-2 mb-4">
                      <span className="text-xl font-light text-black">
                        {formatPrice(product.unitPrice, product.currency)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-text-light line-through">
                          {formatPrice(product.compareAtPrice, product.currency)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      {/* Notify Me Button */}
                      <button
                        disabled
                        className="w-full py-3 bg-premium-beige text-black border border-text-light/30 
               font-light text-xs uppercase tracking-wider flex items-center 
               justify-center gap-2 cursor-not-allowed opacity-60"
                      >
                        <Bell size={14} strokeWidth={1.5} />
                        Notify Me
                      </button>
                    </div>

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
