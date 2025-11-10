import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { getOrders } from "../../service/order";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          icon: CheckCircle2,
          text: "Paid",
        };
      case "pending":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          icon: Clock,
          text: "Pending",
        };
      case "failed":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-sm uppercase tracking-widest">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black text-white uppercase text-xs tracking-wider hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Package size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-light text-gray-700 mb-2 uppercase">
          No Orders Yet
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Start shopping to see your orders here.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 uppercase text-xs tracking-wider hover:bg-gray-800"
        >
          Browse Products
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-light uppercase tracking-widest text-gray-900 mb-8">
          My Orders
        </h1>

        <div className="space-y-5">
          {orders.map((order) => {
            const isGiftCard = order?.giftCardNumber;
            const statusInfo = getStatusColor(order?.paymentStatus);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-light text-gray-700 uppercase mb-1">
                      Order ID:{" "}
                      <span className="font-medium text-black">
                        {order.orderNo || order.id}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`mt-3 sm:mt-0 flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}
                  >
                    <StatusIcon
                      size={14}
                      className={`${statusInfo.color}`}
                    />
                    <span
                      className={`text-xs font-medium uppercase ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {isGiftCard ? (
                      <div className="w-14 h-14 bg-pink-50 flex items-center justify-center rounded-full">
                        <Gift className="text-pink-500" size={26} />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full">
                        <Package className="text-gray-600" size={26} />
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        {isGiftCard
                          ? "Gift Card Purchase"
                          : order?.items?.[0]?.productName || "Product Order"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isGiftCard
                          ? `Gift Card No: ${order.giftCardNumber}`
                          : `${order.items?.length || 0} item(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 uppercase">
                      Total Amount
                    </p>
                    <p className="text-lg font-medium text-black">
                      {formatPrice(order.totalAmount || order.giftCardAmount)}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
                  <button
                    onClick={() => navigate(`/order-details/${order.id}`)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
