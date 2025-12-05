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
  if (typeof price !== 'number' || price === 0) return '0';
  
  // Ensure currency is uppercase and valid
  const currencyCode = currency ? currency.toUpperCase() : 'INR';
  
  // Currency symbol mapping
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'OMR': 'OMR',
    'BHD': 'BHD',
    'JOD': 'JOD',
    'LBP': 'LBP',
    'EGP': 'EGP',
    'IQD': 'IQD'
  };
  
  const symbol = currencySymbols[currencyCode] || currencyCode;
  
  // Format the number with commas
  const formattedNumber = price.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return { symbol, number: formattedNumber };
};


const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  console.log(cartItems, "carrt")
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(() => new Set());
  const [selectedItems, setSelectedItems] = useState(() => new Set());
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

  // Initialize all items as selected when cart loads or when items are added
  useEffect(() => {
    if (cartItems.length > 0) {
      // Only auto-select all if no items are currently selected (initial load)
      // Otherwise, just clean up selections for items that no longer exist
      setSelectedItems((prev) => {
        if (prev.size === 0) {
          // Initial load - select all
          return new Set(cartItems.map(item => getItemKey(item)));
        } else {
          // Clean up - remove selections for items that no longer exist
          const validKeys = new Set(cartItems.map(item => getItemKey(item)));
          const cleaned = new Set(Array.from(prev).filter(key => validKeys.has(key)));
          return cleaned;
        }
      });
    } else {
      // Clear selections when cart is empty
      setSelectedItems(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  // Generate unique key for cart item
  const getItemKey = (item) => {
    return `${item.id}_${item.size || ""}`;
  };

  // Handle individual item selection
  const handleItemSelect = (item) => {
    const itemKey = getItemKey(item);
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemKey)) {
        updated.delete(itemKey);
      } else {
        updated.add(itemKey);
      }
      return updated;
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allItemKeys = new Set(cartItems.map(item => getItemKey(item)));
      setSelectedItems(allItemKeys);
    } else {
      setSelectedItems(new Set());
    }
  };

  // Check if all items are selected
  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  // Get selected cart items
  const getSelectedCartItems = () => {
    return cartItems.filter(item => selectedItems.has(getItemKey(item)));
  };

  const handleAddToWishlist = async (productId, item) => {
    const itemKey = `${productId}_${item.size || ""}`;
    const selectedVariant = (item.variants && Array.isArray(item.variants))
      ? item.variants.find((v) => v.color === item.color && v.size === item.size)
      : null;

    const payload = {
      productId: item.productId,
      size: selectedVariant?.sku || item.size || '',
      desiredQuantity: item.quantity || 1,
      desiredSize: item.size || '',
      desiredColor: item.color || item.variantColor || '',
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


  const removeItem = (itemId, size ,color) => {
    const itemKey = `${itemId}_${size || ""}`;
    setCartItems((prevCart) => {
      const updated = prevCart.filter(item => !(item.id === itemId && item.size === size && item.color === color));
      localStorage.setItem("cart", JSON.stringify(updated));
      dispatch(setCartCount(updated.length));
      return updated;
    });
    // Remove from selected items if it was selected
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      updated.delete(itemKey);
      return updated;
    });
  };


  const getCorrectPrice = (item) => {
    if (!item) return 0;
    
    const product = item || {};
    const priceList = item?.priceList || product?.priceList || [];
    
    if (!Array.isArray(priceList) || priceList.length === 0) {
      return product?.unitPrice || item?.price || product?.price || 0;
    }
    
    const matchingPrice = priceList.find(price =>
      price && price.country === (product.country || item.country) &&
      price.size === (item.size || product.size)
    );
    
    return matchingPrice?.priceAmount || product?.unitPrice || item?.price || product?.price || 0;
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
    const selectedCartItems = getSelectedCartItems();
    if (!selectedCartItems || selectedCartItems.length === 0) return 'INR';
    return selectedCartItems[0]?.product?.currency || 'INR';
  };


  const calculateTotals = () => {
    const selectedCartItems = getSelectedCartItems();
    if (!selectedCartItems || selectedCartItems.length === 0) return { subTotal: 0, shipping: 0, tax: 0, grandTotal: 0 };
    const subTotal = selectedCartItems.reduce((sum, item) => sum + getCorrectPrice(item) * item.quantity, 0);
    const shipping = getShippingPrice(selectedCartItems);
    const tax = 0;
    const grandTotal = subTotal + shipping;

    return { subTotal, shipping, tax, grandTotal };
  };

  const totals = calculateTotals();

  // Loading
  if (isLoading) return (
    <div className="min-h-screen bg-premium-cream flex items-center justify-center font-futura-pt-light">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-premium-beige border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm md:text-base font-light font-futura-pt-light">Loading Cart...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-premium-cream font-futura-pt-light">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-12">

        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 font-futura-pt-book">
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-sm md:text-base font-light leading-relaxed font-futura-pt-light">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 border-2 border-text-light/20 flex items-center justify-center">
                <ShoppingBag size={40} className="text-text-light md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black mb-4 font-futura-pt-book">Your Cart is Empty</h2>
              <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 font-light leading-relaxed font-futura-pt-thin">Discover our premium collection of luxury sleepwear</p>
              <button onClick={() => navigate("/products")} className="inline-flex items-center gap-2 md:gap-3 bg-black text-white px-6 md:px-8 py-3 md:py-4 font-light hover:bg-text-dark transition-colors text-sm md:text-base font-futura-pt-light">
                Start Shopping <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items - Myntra Style List */}
            <div className="lg:col-span-2">
              {/* Select All Checkbox */}
              {cartItems.length > 0 && (
                <div className="bg-white border-b border-text-light/20 px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0 text-black cursor-pointer accent-black"
                    />
                    <span className="text-xs sm:text-sm md:text-base font-light text-black font-futura-pt-light">
                      Select All ({selectedItems.size} of {cartItems.length} items)
                    </span>
                  </label>
                </div>
              )}

              {/* Single Container for All Products - Myntra Style */}
              <div className="bg-white border border-text-light/20 overflow-hidden">
                {cartItems.map((item, index) => {
                const product = item || {};
                const itemKey = getItemKey(item);
                const isWishlisted = wishlistedItems.has(itemKey);
                const isSelected = selectedItems.has(itemKey);
                
                // Get price info
                const priceList = product.priceList || item.priceList || [];
                const matchedPrice = priceList.find(
                  (e) =>
                    e.country?.trim().toUpperCase() === (product.country || item.country)?.trim().toUpperCase() &&
                    e.size?.trim().toUpperCase() === (product.size || item.size)?.trim().toUpperCase()
                );
                const currency = matchedPrice?.currency || product.currency || item.currency || 'INR';
                const priceAmount = matchedPrice?.priceAmount || product.unitPrice || item.price || product.price || 0;
                const priceFormatted = formatPrice(priceAmount, currency);
                
                return (
                  <div 
                    key={item.id + item.size} 
                    className={`flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b ${index === cartItems.length - 1 ? 'border-b-0' : 'border-text-light/20'} ${isSelected ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50/50 transition-colors overflow-hidden`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center flex-shrink-0">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemSelect(item)}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0 text-black cursor-pointer accent-black"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </label>
                    </div>
                    
                    {/* Image - Myntra style compact */}
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 bg-premium-beige overflow-hidden rounded cursor-pointer"
                      onClick={() => navigate(`/productDetail/${product.id}`)}
                    >
                      <img 
                        src={
                          (product.images && Array.isArray(product.images) && product.images.length > 0)
                            ? (product.images[0]?.thumbnailUrl || product.images[0]?.url || product.images[0] || product.thumbnailUrl || product.image || '')
                            : (product.thumbnailUrl || product.image || '')
                        } 
                        alt={product.name || 'Product'} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'} 
                      />
                    </div>

                    {/* Product Details - Myntra style horizontal layout */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 overflow-hidden">
                      {/* Left: Product Info */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 
                          className="font-light text-black text-xs sm:text-sm md:text-base mb-1 line-clamp-2 hover:underline cursor-pointer font-futura-pt-book"
                          onClick={() => navigate(`/productDetail/${product.id}`)}
                        >
                          {product.name}
                        </h3>
                        
                        {/* Product Options - Inline compact */}
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-xs text-text-medium mb-1 font-futura-pt-light">
                          {product.color && (
                            <span className="text-text-medium">
                              Color: <span className="text-black font-light">{product.color}</span>
                            </span>
                          )}
                          {item.size && (
                            <span className="text-text-medium">
                              Size: <span className="text-black font-light">{item.size}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Monogram badge */}
                        {item.monogram && (
                          <div className="inline-flex items-center border border-luxury-gold/30 bg-luxury-gold/5 px-2 py-0.5 text-xs text-luxury-gold font-futura-pt-light mt-1">
                            <span className="font-light text-black font-futura-pt-light">{item.monogram}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Price, Quantity, Actions - Myntra style */}
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                        {/* Price */}
                        <div className="hidden sm:flex items-center flex-shrink-0">
                          <span className="text-sm md:text-base font-light text-black font-futura-pt-light whitespace-nowrap">
                            <span className="font-sans">{priceFormatted.symbol}</span>
                            {priceFormatted.number}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-text-light/30 rounded flex-shrink-0">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, -1)} 
                            disabled={item.quantity <= 1} 
                            className="p-1 sm:p-1.5 hover:bg-premium-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                          </button>
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 font-light text-xs sm:text-sm md:text-base min-w-[28px] sm:min-w-[32px] text-center font-futura-pt-light flex-shrink-0">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, 1)} 
                            className="p-1 sm:p-1.5 hover:bg-premium-beige transition-colors flex-shrink-0"
                          >
                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                          </button>
                        </div>

                        {/* Price on Mobile - Below quantity */}
                        <div className="sm:hidden flex items-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-light text-black font-futura-pt-light whitespace-nowrap">
                            <span className="font-sans">{priceFormatted.symbol}</span>
                            {priceFormatted.number}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddToWishlist(item.id, item)}
                            className={`transition-colors p-1 flex-shrink-0 ${isWishlisted ? "text-black-500 hover:text-premium-beige-600" : "text-text-medium hover:text-premium-beige-500"}`}
                            aria-label="Add to wishlist"
                          >
                            <Heart className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id, item.size ,item.color)}
                            className="text-text-medium hover:text-black transition-colors p-1 flex-shrink-0"
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4 sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-text-light/20 lg:sticky lg:top-24">
                <div className="p-4 md:p-6 border-b border-text-light/20">
                  <h2 className="text-lg md:text-xl text-black mb-1 font-light font-futura-pt-book">Order Summary</h2>
                  <p className="text-sm md:text-base font-light text-text-medium font-futura-pt-light">
                    {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </p>
                </div>

                <div className="p-4 md:p-6 space-y-4">
                  <div className="space-y-3 pb-4 border-b border-text-light/10">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-text-medium font-futura-pt-light">Subtotal</span>
                      {(() => {
                        const priceFormatted = formatPrice(totals.subTotal, getCurrency());
                        return (
                          <span className="text-black font-light font-futura-pt-light">
                            <span className="font-sans">{priceFormatted.symbol}</span>
                            {priceFormatted.number}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-text-medium  font-futura-pt-light">Shipping</span>
                      {totals.shipping === 0 ? (
                        <span className="text-black font-light font-futura-pt-light">Free</span>
                      ) : (
                        (() => {
                          const priceFormatted = formatPrice(totals.shipping, getCurrency());
                          return (
                            <span className="text-black font-light font-futura-pt-light">
                              <span className="font-sans">{priceFormatted.symbol}</span>
                              {priceFormatted.number}
                            </span>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 pb-4 md:pb-6 border-b border-text-light/20">
                    <span className="text-black text-lg md:text-lg  font-light font-futura-pt-book">Total</span>
                    {(() => {
                      const priceFormatted = formatPrice(totals.grandTotal, getCurrency());
                      return (
                        <span className="text-xl md:text-2xl font-light text-black font-futura-pt-light">
                          <span className="font-sans">{priceFormatted.symbol}</span>
                          {priceFormatted.number}
                          <p className="text-sm font-futura-pt-thin">(inc. all taxes)</p>
                        </span>
                      );
                    })()}
                  </div>

                  {totals.shipping === 0 && (
                    <div className="space-y-3 py-4 border-b border-text-light/20">
                      <div className="flex items-start gap-3">
                        <Truck size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-light text-black font-futura-pt-light">Free Shipping</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RotateCcw size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-light text-black font-futura-pt-light">Easy Returns</p>
                          <p className="text-xs md:text-sm font-light font-futura-pt-thin">30-day return policy</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const selectedCartItems = getSelectedCartItems();
                      if (selectedCartItems.length === 0) {
                        message.error("Please select at least one item to proceed to checkout");
                        return;
                      }
                      navigate("/checkout", {
                        state: {
                          checkoutProd: { items: selectedCartItems },
                          selectedItems: selectedCartItems
                        }
                      });
                    }}
                    disabled={selectedItems.size === 0}
                    className="w-full bg-black text-white py-3 md:py-4 font-light hover:bg-text-dark rounded-full transition-colors text-sm md:text-base flex items-center justify-center gap-2 md:gap-3 disabled:bg-text-light disabled:cursor-not-allowed font-futura-pt-light"
                  >
                    Proceed to Checkout <ArrowRight size={18} strokeWidth={1.5} />
                  </button>

                  <button onClick={() => navigate("/products")} className="w-full mt-3 border-2 rounded-full border-text-light/30 text-black py-3 md:py-4 font-light hover:border-black transition-colors text-sm md:text-base font-futura-pt-light">
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
