import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Heart, Trash2, ShoppingBag, ArrowRight, Truck, RotateCcw } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../redux/cartSlice";
import { addToWishlist } from "../../service/wishlist";
import { message } from "../../comman/toster-message/ToastContainer";

/**
 * Format price based on currency
 */
const formatPrice = (price, currency) => {
  console.log(price, currency)
  if (typeof price !== 'number') return '0';
  return price.toLocaleString(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};


const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  console.log(cartItems, "carrt")
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(() => new Set());
  const fetchCart = useCallback(() => {
    setIsLoading(true);
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(storedCart);
      dispatch(setCartCount(storedCart.length));
    } catch (err) {
      console.error("Error reading cart from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);


  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleAddToWishlist = async (productId, item) => {
    const itemKey = `${productId}_${item.size || ""}`;
    const selectedVariant = item.variants.find(
      (v) => v.color === item.color && v.size === item.size
    );

    const payload = {
      productId: item.productId,
      size: selectedVariant?.sku || '',
      desiredQuantity: item.quantity,
      desiredSize: item.size,
      desiredColor: item.color,
      notifyWhenBackInStock: true,

    }

    try {
      const result = await addToWishlist(productId, payload);
      console.log("Added to wishlist:", result);
      message.success("Product added to wishlist!");
      setWishlistedItems((prev) => {
        const updated = new Set(prev);
        updated.add(itemKey);
        return updated;
      });
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      message.error("Failed to add to wishlist");
    }
  };
  const updateQuantity = (itemId, size, delta) => {
    setCartItems((prevCart) => {
      const updated = prevCart.map((item) => {
        if (item.id === itemId && item.size === size) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };


  const removeItem = (itemId, size) => {
    setCartItems((prevCart) => {
      const updated = prevCart.filter(item => !(item.id === itemId && item.size === size));
      localStorage.setItem("cart", JSON.stringify(updated));
      dispatch(setCartCount(updated.length));
      return updated;
    });
  };


  const getCorrectPrice = (item) => {
    console.log(item)
    const product = item || {};

    const priceList = item?.priceList || [];
    const matchingPrice = priceList.find(price =>
      price.country === product.country &&
      price.size === item.size
    );
    return matchingPrice ? matchingPrice.priceAmount : (product?.unitPrice || 0);
  };


  const getShippingPrice = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const countryPrice = item?.product?.countryPrice;
      if (countryPrice && countryPrice.priceAmount !== undefined) {
        total += countryPrice.priceAmount;
      }
      return total;
    }, 0);
  };

  const getCurrency = () => {
    if (!cartItems || cartItems.length === 0) return 'INR';
    return cartItems[0]?.product?.currency || 'INR';
  };


  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) return { subTotal: 0, shipping: 0, tax: 0, grandTotal: 0 };
    const subTotal = cartItems.reduce((sum, item) => sum + getCorrectPrice(item) * item.quantity, 0);
    const shipping = getShippingPrice(cartItems);
    const tax = 0;
    const grandTotal = subTotal + shipping;

    return { subTotal, shipping, tax, grandTotal };
  };

  const totals = calculateTotals();

  // Loading
  if (isLoading) return (
    <div className="min-h-screen bg-premium-cream flex items-center justify-center font-sweet-sans">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-medium text-sm uppercase tracking-wider">Loading Cart...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-premium-cream font-sweet-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-12">

        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 uppercase tracking-widest mb-2 md:mb-3">
            Shopping Cart
          </h1>
          <p className="text-text-medium font-light text-sm md:text-base">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 border-2 border-text-light/20 flex items-center justify-center">
                <ShoppingBag size={40} className="text-text-light md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-light text-black mb-3 md:mb-4 uppercase tracking-wider font-sweet-sans">Your Cart is Empty</h2>
              <p className="text-sm md:text-base text-text-medium mb-6 md:mb-8">Discover our premium collection of luxury sleepwear</p>
              <button onClick={() => navigate("/products")} className="inline-flex items-center gap-2 md:gap-3 bg-black text-white px-6 md:px-8 py-3 md:py-4 font-light hover:bg-text-dark transition-colors uppercase tracking-wider text-xs md:text-sm">
                Start Shopping <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                const product = item || {};
                const itemKey = `${item.id}_${item.size || ""}`;
                const isWishlisted = wishlistedItems.has(itemKey);

              
                return (
                  <div key={item.id + item.size} className="bg-white border border-text-light/20 p-4 md:p-6 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full sm:w-28 md:w-32 h-32 flex-shrink-0 bg-premium-beige overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/productDetail/${product.id}`)}>
                        <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-light text-black text-base md:text-lg mb-2 line-clamp-2 hover:underline cursor-pointer uppercase tracking-tight font-sweet-sans"
                              onClick={() => navigate(`/productDetail/${product.id}`)}>
                              {product.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-text-medium mb-2">
                              {product.variantColor && <span>Color: <span className="text-black font-light capitalize">{product.variantColor}</span></span>}
                              {item.size && <span className="font-light">Size: <span className="text-black font-light">{item.size}</span></span>}
                            </div>
                             {item.monogram && (
                          <div className="inline-flex items-center gap-2  border border-luxury-gold/30 bg-luxury-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-luxury-gold">
                           
                            <span className="font-light tracking-[0.2em] text-black text-[11px]">{item.monogram}</span>
                          </div>
                        )}
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAddToWishlist(item.id, item)}
                              className={`transition-colors ${isWishlisted ? "text-black-500 hover:text-premium-beige-600" : "text-text-medium hover:text-premium-beige-500"}`}
                              aria-label="Add to wishlist"
                            >
                              <Heart size={18} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id, item.size)}
                              className="text-text-medium hover:text-black transition-colors"
                              aria-label="Remove from cart"
                            >
                              <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <span className="text-xl md:text-2xl font-light text-black">{formatPrice(product.priceList.find(
                            (e) =>
                              e.country?.trim().toUpperCase() === product.country?.trim().toUpperCase() &&
                              e.size?.trim().toUpperCase() === product.size?.trim().toUpperCase()
                          ).priceAmount, product.priceList.find((e) => (e.country === product.country && e.size === product.size)).currency)}</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center border-2 border-text-light/30">
                            <button onClick={() => updateQuantity(item.id, item.size, -1)} disabled={item.quantity <= 1} className="p-2 hover:bg-premium-beige transition-colors">
                              <Minus size={14} strokeWidth={2} />
                            </button>
                            <span className="px-4 md:px-6 py-2 font-light text-sm md:text-base min-w-[50px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-2 hover:bg-premium-beige transition-colors">
                              <Plus size={14} strokeWidth={2} />
                            </button>
                          </div>

                          {/* <button onClick={() => moveToWishlist(item.id, item.size)} className="flex items-center gap-2 text-xs md:text-sm text-text-medium hover:text-black transition-colors">
                            <Heart size={14} strokeWidth={1.5} />
                            <span className="hidden sm:inline">Wishlist</span>
                          </button> */}


                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-text-light/20 lg:sticky lg:top-24">
                <div className="p-4 md:p-6 border-b border-text-light/20">
                  <h2 className="text-lg md:text-xl text-text-medium text-black uppercase tracking-wider mb-1 font-futura">Order Summary</h2>
                  <p className="text-xs md:text-sm font-light text-text-medium">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div className="space-y-3 pb-4 border-b border-text-light/10">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-text-medium">Subtotal</span>
                      <span className="text-black font-light">{formatPrice(totals.subTotal, getCurrency())}</span>
                    </div>

                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-text-medium">Shipping</span>
                      {totals.shipping === 0 ? (
                        <span className="text-black font-light">FREE</span>
                      ) : (
                        <span className="text-black font-light">{formatPrice(totals.shipping, getCurrency())}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 pb-4 md:pb-6 border-b border-text-light/20">
                    <span className="text-base md:text-lg text-text-medium text-black uppercase tracking-wider font-sweet-sans">Total</span>
                    <span className="text-xl md:text-2xl font-light text-black font-sweet-sans">{formatPrice(totals.grandTotal, getCurrency())}</span>
                  </div>

                  {totals.shipping === 0 && (
                    <div className="space-y-3 py-4 border-b border-text-light/20">
                      <div className="flex items-start gap-3">
                        <Truck size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-light text-black">Free Shipping</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RotateCcw size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-light text-black">Easy Returns</p>
                          <p className="text-xs font-light">30-day return policy</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={cartItems.length === 0}
                    className="w-full bg-black text-white py-3 md:py-4 font-light hover:bg-text-dark transition-colors uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 disabled:bg-text-light disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout <ArrowRight size={18} strokeWidth={1.5} />
                  </button>

                  <button onClick={() => navigate("/products")} className="w-full mt-3 border-2 border-text-light/30 text-black py-3 md:py-4 font-light hover:border-black transition-colors uppercase tracking-wider text-xs md:text-sm">
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
