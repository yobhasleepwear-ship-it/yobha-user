import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, XCircle, 
  Clock, MapPin, Phone, Mail, Gift
} from "lucide-react";
import { getOrderDetails } from "../../service/order";

/**
 * Helper function to safely format order detail data from API
 * Handles null checks and provides fallbacks
 */
const formatOrderDetailData = (orderData) => {
  if (!orderData) return null;

  const data = orderData.data || orderData;

  // Handle gift card orders
  const isGiftCard = data?.giftCardNumber;

  return {
    id: data?.id || '',
    orderNo: data?.orderNo || data?.id || '',
    userId: data?.userId || '',
    
    // Gift Card Info
    giftCardNumber: data?.giftCardNumber || null,
    giftCardAmount: data?.giftCardAmount || null,
    
    // Items with null checks
    items: Array.isArray(data?.items) && data.items.length > 0
      ? data.items.map(item => ({
          productId: item?.productId || '',
          productObjectId: item?.productObjectId || '',
          productName: item?.productName || 'Untitled Product',
          variantSku: item?.variantSku || '',
          variantId: item?.variantId || '',
          quantity: typeof item?.quantity === 'number' ? item.quantity : 0,
          unitPrice: typeof item?.unitPrice === 'number' ? item.unitPrice : 0,
          lineTotal: typeof item?.lineTotal === 'number' ? item.lineTotal : 0,
          compareAtPrice: typeof item?.compareAtPrice === 'number' ? item.compareAtPrice : null,
          currency: item?.currency || 'INR',
          thumbnailUrl: item?.thumbnailUrl || item?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+',
          slug: item?.slug || '',
        }))
      : [],
    
    // Pricing
    subTotal: typeof data?.subTotal === 'number' ? data.subTotal : (data?.totalAmount || 0),
    shipping: typeof data?.shipping === 'number' ? data.shipping : 0,
    tax: typeof data?.tax === 'number' ? data.tax : 0,
    discount: typeof data?.discount === 'number' ? data.discount : 0,
    total: typeof data?.total === 'number' ? data.total : (data?.totalAmount || data?.giftCardAmount || 0),
    totalAmount: typeof data?.totalAmount === 'number' ? data.totalAmount : (data?.total || data?.giftCardAmount || 0),
    
    // Status and dates
    status: data?.status || data?.paymentStatus || 'Pending',
    paymentStatus: data?.paymentStatus || data?.status || 'Pending',
    createdAt: data?.createdAt || null,
    updatedAt: data?.updatedAt || null,

    // Additional fields
    shippingAddress: data?.shippingAddress || data?.address || null,
    trackingNumber: data?.trackingNumber || null,
    estimatedDelivery: data?.estimatedDelivery || null,
    deliveredAt: data?.deliveredAt || null,
  };
};

/**
 * Get status display info - Black and White Theme
 */
const getStatusInfo = (status) => {
  const normalizedStatus = (status || '').toLowerCase();
  
  const statusMap = {
    paid: {
      icon: CheckCircle2,
      text: "Paid",
      color: "text-black",
      bg: "bg-gray-100",
    },
    pending: {
      icon: Clock,
      text: "Pending",
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    confirmed: {
      icon: CheckCircle2,
      text: "Confirmed",
      color: "text-black",
      bg: "bg-gray-100",
    },
    processing: {
      icon: Clock,
      text: "Processing",
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    shipped: {
      icon: Truck,
      text: "Shipped",
      color: "text-black",
      bg: "bg-gray-100",
    },
    delivered: {
      icon: CheckCircle2,
      text: "Delivered",
      color: "text-black",
      bg: "bg-gray-100",
    },
    cancelled: {
      icon: XCircle,
      text: "Cancelled",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    failed: {
      icon: XCircle,
      text: "Failed",
      color: "text-gray-700",
      bg: "bg-gray-100",
    }
  };
  
  return statusMap[normalizedStatus] || statusMap.pending;
};

/**
 * Format price to INR
 */
const formatPrice = (price, currency = 'INR') => {
  if (typeof price !== 'number') return '₹0';
  const symbol = currency === 'INR' ? '₹' : currency;
  return `${symbol}${price.toLocaleString('en-IN', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // API State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getOrderDetails(orderId);
        
        if (response) {
          const formattedOrder = formatOrderDetailData(response);
          if (formattedOrder) {
            setOrder(formattedOrder);
          } else {
            setError('Invalid order data received');
          }
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(err.response?.data?.message || 'Failed to load order details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-futura-pt-light">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs md:text-sm font-light font-futura-pt-light">
            Loading Order...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-futura-pt-light px-4">
        <Package size={48} className="text-gray-400 mb-4" strokeWidth={1.5} />
        <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
          {error || 'Order Not Found'}
        </h2>
        <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light mb-6 text-center max-w-md">
          {error || 'The order you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 bg-black text-white uppercase text-xs tracking-wider hover:bg-gray-900 transition-colors font-light font-futura-pt-light"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isGiftCard = order.giftCardNumber;
  const statusInfo = getStatusInfo(order.status || order.paymentStatus);
  const StatusIcon = statusInfo.icon;
  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="bg-white min-h-screen font-futura-pt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12">
        
        {/* Back Button & Page Header */}
        <div className="mb-8 md:mb-10">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors font-light font-futura-pt-light"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span className="text-xs sm:text-sm uppercase tracking-wider">Back to Orders</span>
          </button>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
              Order Details
            </h1>
            <div className="w-12 md:w-16 h-px bg-gray-300 mb-4 md:mb-5" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light">
                Order ID: <span className="text-black">{order.orderNo || order.id}</span>
              </p>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusInfo.bg} border border-gray-200`}>
                <StatusIcon size={14} className={statusInfo.color} strokeWidth={1.5} />
                <span className={`text-xs font-light uppercase font-futura-pt-light ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs md:text-sm text-gray-600 font-light font-futura-pt-light">
              <span>Placed: <span className="text-black">{formatDate(order.createdAt)}</span></span>
              {order.updatedAt && (
                <span>Updated: <span className="text-black">{formatDate(order.updatedAt)}</span></span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gift Card Info */}
            {isGiftCard && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 sm:px-5 md:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase font-futura-pt-light flex items-center gap-2">
                    <Gift size={20} strokeWidth={1.5} className="text-black" />
                    Gift Card Purchase
                  </h2>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-light font-futura-pt-light mb-1">
                        Gift Card Number
                      </p>
                      <p className="text-black text-sm md:text-base font-light font-futura-pt-light">
                        {order.giftCardNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs md:text-sm font-light font-futura-pt-light mb-1">
                        Gift Card Amount
                      </p>
                      <p className="text-black text-lg md:text-xl font-light font-futura-pt-light">
                        {formatPrice(order.giftCardAmount || order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {!isGiftCard && order.items.length > 0 && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 sm:px-5 md:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase font-futura-pt-light">
                    Order Items ({totalItems})
                  </h2>
                </div>

                <div className="p-4 sm:p-5 md:p-6 space-y-4">
                  {order.items.map((item, index) => {
                    const savingsAmount = item.compareAtPrice 
                      ? (item.compareAtPrice - item.unitPrice) * item.quantity
                      : 0;

                    return (
                      <div 
                        key={`${item.productId}-${index}`}
                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                      >
                        <div 
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 border border-gray-200 overflow-hidden cursor-pointer"
                          onClick={() => item.productId && navigate(`/productDetail/${item.productId}`)}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-light text-black text-sm sm:text-base md:text-lg mb-2 line-clamp-2 hover:underline cursor-pointer uppercase font-futura-pt-light"
                            onClick={() => item.productId && navigate(`/productDetail/${item.productId}`)}
                          >
                            {item.productName}
                          </h3>
                          
                          <div className="space-y-1 mb-3">
                            {item.variantSku && (
                              <p className="text-gray-600 text-xs font-light font-futura-pt-light">
                                SKU: <span className="text-black">{item.variantSku}</span>
                              </p>
                            )}
                            <p className="text-gray-600 text-xs font-light font-futura-pt-light">
                              Quantity: <span className="text-black">{item.quantity}</span>
                            </p>
                            <p className="text-gray-600 text-xs font-light font-futura-pt-light">
                              Unit Price: <span className="text-black">{formatPrice(item.unitPrice, item.currency)}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-base sm:text-lg md:text-xl font-light text-black font-futura-pt-light">
                              {formatPrice(item.lineTotal, item.currency)}
                            </span>
                            {item.compareAtPrice && (
                              <>
                                <span className="text-xs sm:text-sm text-gray-400 line-through font-light font-futura-pt-light">
                                  {formatPrice(item.compareAtPrice * item.quantity, item.currency)}
                                </span>
                                {savingsAmount > 0 && (
                                  <span className="text-xs bg-black text-white px-2 py-0.5 uppercase tracking-wider font-light font-futura-pt-light">
                                    Saved {formatPrice(savingsAmount, item.currency)}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white border border-gray-200">
                <div className="px-4 sm:px-5 md:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase font-futura-pt-light flex items-center gap-2">
                    <MapPin size={20} strokeWidth={1.5} className="text-black" />
                    Delivery Address
                  </h2>
                </div>

                <div className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base font-light text-black font-futura-pt-light">
                      {order.shippingAddress.fullName || order.shippingAddress.name}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm font-light font-futura-pt-light">
                      {order.shippingAddress.addressLine1 || order.shippingAddress.address}
                      {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm font-light font-futura-pt-light">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm font-light font-futura-pt-light">
                      {order.shippingAddress.country}
                    </p>
                    {order.shippingAddress.landmark && (
                      <p className="text-gray-600 text-xs font-light font-futura-pt-light italic">
                        Landmark: {order.shippingAddress.landmark}
                      </p>
                    )}
                    
                    <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                      {order.shippingAddress.phone && (
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm font-light font-futura-pt-light">
                          <Phone size={14} strokeWidth={1.5} />
                          <span>{order.shippingAddress.phone}</span>
                        </div>
                      )}
                      {order.shippingAddress.email && (
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm font-light font-futura-pt-light">
                          <Mail size={14} strokeWidth={1.5} />
                          <span>{order.shippingAddress.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 lg:sticky lg:top-24">
              <div className="px-4 sm:px-5 md:px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase font-futura-pt-light">
                  Order Summary
                </h2>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600 font-light font-futura-pt-light">Subtotal</span>
                    <span className="text-black font-light font-futura-pt-light">
                      {formatPrice(order.subTotal)}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600 font-light font-futura-pt-light">Discount</span>
                      <span className="text-black font-light font-futura-pt-light">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600 font-light font-futura-pt-light">Shipping</span>
                    {order.shipping === 0 ? (
                      <span className="text-black font-light font-futura-pt-light">FREE</span>
                    ) : (
                      <span className="text-black font-light font-futura-pt-light">
                        {formatPrice(order.shipping)}
                      </span>
                    )}
                  </div>

                  {order.tax > 0 && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600 font-light font-futura-pt-light">Tax</span>
                      <span className="text-black font-light font-futura-pt-light">
                        {formatPrice(order.tax)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between pt-4 pb-4 md:pb-6 border-b border-gray-200">
                  <span className="text-sm sm:text-base md:text-lg font-light text-black uppercase font-futura-pt-light">
                    Total Paid
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-light text-black font-futura-pt-light">
                    {formatPrice(order.total || order.totalAmount)}
                  </span>
                </div>

                {/* Tracking & Delivery Info */}
                {order.trackingNumber && (
                  <div className="py-4 border-b border-gray-200">
                    <p className="text-gray-600 text-xs font-light uppercase font-futura-pt-light mb-2">
                      Tracking Number
                    </p>
                    <p className="text-black text-sm font-light font-futura-pt-light">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}

                {order.estimatedDelivery && (order.status?.toLowerCase() !== 'delivered' && order.paymentStatus?.toLowerCase() !== 'delivered') && (
                  <div className="py-4 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <Truck size={16} className="text-gray-600 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-gray-600 text-xs font-light uppercase font-futura-pt-light mb-1">Estimated Delivery</p>
                        <p className="text-black text-sm font-light font-futura-pt-light">
                          {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="py-4 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-black mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-gray-600 text-xs font-light uppercase font-futura-pt-light mb-1">Delivered On</p>
                        <p className="text-black text-sm font-light font-futura-pt-light">
                          {formatDate(order.deliveredAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {order.status?.toLowerCase() === 'delivered' && !isGiftCard && (
                    <button
                      onClick={() => {
                        // TODO: Implement reorder functionality
                        console.log('Reorder items:', order.items);
                      }}
                      className="w-full border border-gray-300 text-black py-3 font-light hover:border-black hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs sm:text-sm font-futura-pt-light"
                    >
                      Reorder
                    </button>
                  )}

                  {['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase() || order.paymentStatus?.toLowerCase() || '') && (
                    <button
                      onClick={() => {
                        // TODO: Implement cancel order functionality
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          console.log('Cancel order:', order.id);
                        }
                      }}
                      className="w-full border border-gray-300 text-black py-3 font-light hover:border-black hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs sm:text-sm font-futura-pt-light"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
