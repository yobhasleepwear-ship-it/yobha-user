import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { getOrders } from "../../service/order";
import BuybackModal from "./BuybackModal";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBuybackModal, setShowBuybackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemSelection, setShowItemSelection] = useState(false);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await getOrders();
        console.log("Orders:", res.data);

        // Assuming your data structure is like { data: [...] }
        setOrders(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price, currency = "INR") => {
    if (price === null || price === undefined || price === "") return "0";
    
    const numericAmount = Number(price || 0);
    if (Number.isNaN(numericAmount)) {
      return String(price || 0);
    }

    const currencyCode = String(currency || "INR").toUpperCase();
    const currencySymbols = {
      INR: "₹",
      USD: "$",
      AED: "AED",
      SAR: "SAR",
      QAR: "QAR",
      KWD: "KWD",
      OMR: "OMR",
      BHD: "BHD",
      JOD: "JOD",
      LBP: "LBP",
      EGP: "EGP",
      IQD: "IQD",
    };

    const symbol = currencySymbols[currencyCode] || currencyCode;

    return `${symbol}${numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return {
          color: "text-black",
          bg: "bg-gray-100",
          icon: CheckCircle2,
          text: "Paid",
        };
      case "pending":
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: Clock,
          text: "Pending",
        };
      case "failed":
        return {
          color: "text-gray-700",
          bg: "bg-gray-100",
          icon: XCircle,
          text: "Failed",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: Clock,
          text: "Pending",
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-futura-pt-light">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-black font-light font-futura-pt-light">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-futura-pt-light">
        <h2 className="text-2xl md:text-3xl font-light text-black mb-4 font-futura-pt-book">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-futura-pt-light px-4">
        <Package size={48} className="text-gray-400 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl md:text-3xl font-light text-black mb-4 font-futura-pt-book">
          No Orders Yet
        </h2>
        <p className="text-sm text-black font-light leading-relaxed font-futura-pt-light mb-6">
          Start shopping to see your orders here.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light"
        >
          Browse Products
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="bg-white min-h-screen font-futura-pt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-light text-black mb-2 font-futura-pt-book">
            My Orders
          </h1>
          <p className="text-sm text-black font-light font-futura-pt-light">
            View and track all your orders
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const isGiftCard = order?.giftCardNumber;
            const statusInfo = getStatusColor(order?.paymentStatus);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 md:p-6 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-base font-light text-black mb-0.5 font-futura-pt-book">
                      Order ID: <span className="font-light font-futura-pt-light">{ order.id}</span>
                    </h2>
                    <p className="text-sm font-light text-black font-futura-pt-light">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className={`mt-3 sm:mt-0 flex items-center gap-2 px-3 py-1.5 ${statusInfo.bg} border border-gray-200`}>
                    <StatusIcon
                      size={14}
                      className={statusInfo.color}
                      strokeWidth={1.5}
                    />
                    <span className={`text-xs font-light font-futura-pt-light ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {isGiftCard ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Gift className="text-black" size={24} strokeWidth={1.5} />
                      </div>
                    ) : (
                      (() => {
                        const firstItem = order?.items?.[0] || {};
                        const imgSrc =
                          firstItem?.thumbnailUrl ||
                          firstItem?.image ||
                          firstItem?.productImage ||
                          firstItem?.imageUrl ||
                          null;
                        const altText = firstItem?.productName || "Product";
                        return (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={altText}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCAxNTAgMTUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNzUiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                                }}
                              />
                            ) : (
                              <Package className="text-black" size={24} strokeWidth={1.5} />
                            )}
                          </div>
                        );
                      })()
                    )}

                    <div className="flex-1">
                      <h3 className="text-base font-light text-black mb-1 font-futura-pt-book">
                        {isGiftCard
                          ? "Gift Card Purchase"
                          : order?.items?.[0]?.productName || "Product Order"}
                      </h3>
                      <p className="text-sm font-light text-black font-futura-pt-light">
                        {isGiftCard
                          ? `Gift Card No: ${order.giftCardNumber}`
                          : `${order.items?.length || 0} item(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex sm:block items-center justify-between sm:justify-end gap-4">
                    <div>
                      <p className="text-base font-light text-black mb-0.5 font-futura-pt-book">
                        Total Amount
                      </p>
                      <p className="text-base font-light text-black font-futura-pt-light">
                        <span className="font-sans">
                          {formatPrice(order.giftCardNumber===''?order.subTotal:order.total ,order.currency)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 sm:px-5 md:px-6 py-3 flex flex-wrap justify-end gap-3">
                  {!isGiftCard && order?.items && order.items.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        // If multiple items, show item selection first
                        if (order.items.length > 1) {
                          setShowItemSelection(true);
                        } else {
                          // Single item, set it and show buyback modal directly
                          setSelectedItem(order.items[0]);
                          setShowBuybackModal(true);
                        }
                      }}
                      className="flex items-center gap-2 text-xs sm:text-sm text-black hover:text-gray-600 transition-colors font-light font-futura-pt-light"
                    >
                      <RotateCcw size={16} strokeWidth={1.5} />
                      Buyback
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/order-details/${order.id}`)}
                    className="flex items-center gap-2 text-xs sm:text-sm text-black hover:text-gray-600 transition-colors font-light font-futura-pt-light"
                  >
                    View Details
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Selection Modal (if multiple items) */}
      {showItemSelection && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-light text-black font-futura-pt-book">
                Select Item for Buyback
              </h2>
              <button
                onClick={() => {
                  setShowItemSelection(false);
                  setSelectedOrder(null);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-black mb-4 font-light font-futura-pt-light">
                Please select which item from this order you'd like to submit for buyback.
              </p>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowItemSelection(false);
                      setShowBuybackModal(true);
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 hover:border-black transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.thumbnailUrl || item.image || item.productImage ? (
                          <img
                            src={item.thumbnailUrl || item.image || item.productImage}
                            alt={item.productName || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-black" size={24} strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-light text-black mb-1 font-futura-pt-book">
                          {item.productName || "Product"}
                        </p>
                        <p className="text-sm text-black font-light font-futura-pt-light">
                          Product ID: {item.productId || "N/A"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buyback Modal */}
      <BuybackModal
        isOpen={showBuybackModal}
        onClose={() => {
          setShowBuybackModal(false);
          setSelectedOrder(null);
          setSelectedItem(null);
        }}
        onSelectOption={(optionId) => {
          // Use selected item or first item as fallback
          const item = selectedItem || selectedOrder?.items?.[0] || null;
          
          // Navigate to buyback condition check page
          navigate("/buyback-from-order", {
            state: {
              order: selectedOrder,
              selectedOption: optionId,
              selectedItem: item,
            },
          });
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrdersPage;
