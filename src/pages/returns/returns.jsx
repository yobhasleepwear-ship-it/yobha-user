import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronRight,
  Package,
} from "lucide-react";
import { getReturns, updateReturn, cancelReturn } from "../../service/returns";
import { message } from "../../comman/toster-message/ToastContainer";

const ReturnsPage = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [editingReturn, setEditingReturn] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [returnToCancel, setReturnToCancel] = useState(null);

  // Fetch Returns
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setIsLoading(true);
        const res = await getReturns(page, pageSize);
        console.log("Returns:", res);
        setReturns(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to fetch returns", err);
        setError("Failed to load returns. Please try again.");
        message.error(err.response?.data?.message || "Failed to load returns");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReturns();
  }, [page, pageSize]);

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
      case "approved":
      case "completed":
        return {
          color: "text-black",
          bg: "bg-gray-100",
          icon: CheckCircle2,
          text: "Approved",
        };
      case "pending":
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: Clock,
          text: "Pending",
        };
      case "rejected":
      case "cancelled":
        return {
          color: "text-gray-700",
          bg: "bg-gray-100",
          icon: XCircle,
          text: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
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

  const handleEdit = (returnItem) => {
    if (returnItem.status !== "Pending") {
      message.error("Only pending returns can be edited");
      return;
    }
    setEditingReturn(returnItem);
    setEditReason(returnItem.returnReason || "");
    setEditImages(returnItem.returnImagesURLs || []);
  };

  const handleUpdate = async () => {
    if (!editingReturn) return;

    try {
      const data = {
        returnReason: editReason,
        returnImagesURLs: editImages,
      };
      await updateReturn(editingReturn.id, data);
      message.success("Return request updated successfully");
      setEditingReturn(null);
      setEditReason("");
      setEditImages([]);
      // Refresh returns list
      const res = await getReturns(page, pageSize);
      setReturns(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to update return", err);
      message.error(err.response?.data?.message || "Failed to update return");
    }
  };

  const handleCancelClick = (returnItem) => {
    setReturnToCancel(returnItem);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!returnToCancel) return;

    try {
      await cancelReturn(returnToCancel.id);
      message.success("Return request cancelled successfully");
      setShowCancelModal(false);
      setReturnToCancel(null);
      // Refresh returns list
      const res = await getReturns(page, pageSize);
      setReturns(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to cancel return", err);
      message.error(err.response?.data?.message || "Failed to cancel return");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-futura-pt-light">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-black font-light font-futura-pt-light">
            Loading Returns...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && returns.length === 0) {
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
  if (returns.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-futura-pt-light px-4">
        <RotateCcw size={48} className="text-gray-400 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl md:text-3xl font-light text-black mb-4 font-futura-pt-book">
          No Returns Yet
        </h2>
        <p className="text-sm text-black font-light leading-relaxed font-futura-pt-light">
          You haven't requested any returns yet.
        </p>
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
            My Returns
          </h1>
          <p className="text-sm text-black font-light font-futura-pt-light">
            View and manage all your return requests
          </p>
        </div>

        {/* Returns List */}
        <div className="space-y-4">
          {returns.map((returnItem) => {
            const statusInfo = getStatusColor(returnItem.status);
            const StatusIcon = statusInfo.icon;
            const isPending = returnItem.status === "Pending";

            return (
              <div
                key={returnItem.id}
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 md:p-6 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-base font-light text-black mb-0.5 font-futura-pt-book">
                      Return Order: <span className="font-light font-futura-pt-light">{returnItem.returnOrderNumber || returnItem.id}</span>
                    </h2>
                    <p className="text-sm font-light text-black font-futura-pt-light">
                      Order: {returnItem.orderNumber}
                    </p>
                    <p className="text-sm font-light text-black font-futura-pt-light">
                      {formatDate(returnItem.createdAt)}
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
                <div className="p-4 sm:p-5 md:p-6">
                  {/* Items */}
                  {returnItem.items && returnItem.items.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-light text-black mb-3 font-futura-pt-book">
                        Items
                      </h3>
                      <div className="space-y-3">
                        {returnItem.items.map((item, index) => {
                          const imgSrc =
                            item?.thumbnailUrl ||
                            item?.image ||
                            item?.productImage ||
                            item?.imageUrl ||
                            null;
                          const altText = item?.productName || "Product";
                          return (
                            <div key={index} className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                              <div className="flex-1">
                                <p className="text-sm font-light text-black mb-1 font-futura-pt-book">
                                  {item?.productName || "Product"}
                                </p>
                                {item?.quantity && (
                                  <p className="text-xs font-light text-black font-futura-pt-light">
                                    Quantity: {item.quantity}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Return Reason */}
                  {returnItem.returnReason && (
                    <div className="mb-4">
                      <h3 className="text-sm font-light text-black mb-2 font-futura-pt-book">
                        Reason
                      </h3>
                      <p className="text-sm font-light text-black font-futura-pt-light">
                        {returnItem.returnReason}
                      </p>
                    </div>
                  )}

                  {/* Return Images */}
                  {returnItem.returnImagesURLs && returnItem.returnImagesURLs.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-light text-black mb-2 font-futura-pt-book">
                        Images
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {returnItem.returnImagesURLs.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Return image ${index + 1}`}
                            className="w-20 h-20 object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCAxNTAgMTUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNzUiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refund Info */}
                  {returnItem.refundAmount && (
                    <div className="mb-4">
                      <h3 className="text-sm font-light text-black mb-1 font-futura-pt-book">
                        Refund Amount
                      </h3>
                      <p className="text-base font-light text-black font-futura-pt-light">
                        {formatPrice(returnItem.refundAmount, returnItem.currency)}
                      </p>
                      {returnItem.refundStatus && (
                        <p className="text-xs font-light text-black font-futura-pt-light mt-1">
                          Status: {returnItem.refundStatus}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {isPending && (
                  <div className="border-t border-gray-200 px-4 sm:px-5 md:px-6 py-3 flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleCancelClick(returnItem)}
                      className="flex items-center gap-2 text-xs sm:text-sm text-black hover:text-gray-600 transition-colors font-light font-futura-pt-light"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {returns.length >= pageSize && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-black font-light font-futura-pt-light">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={returns.length < pageSize}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-light text-black font-futura-pt-book">
                Edit Return Request
              </h2>
              <button
                onClick={() => {
                  setEditingReturn(null);
                  setEditReason("");
                  setEditImages([]);
                }}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-light text-black mb-2 font-futura-pt-book">
                  Return Reason
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black"
                  rows="4"
                  placeholder="Enter return reason"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-black mb-2 font-futura-pt-book">
                  Return Images URLs (comma-separated)
                </label>
                <textarea
                  value={editImages.join(", ")}
                  onChange={(e) => setEditImages(e.target.value.split(",").map(url => url.trim()).filter(url => url))}
                  className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-black font-light font-futura-pt-light text-black"
                  rows="3"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingReturn(null);
                    setEditReason("");
                    setEditImages([]);
                  }}
                  className="px-6 py-2 border border-gray-200 text-black text-sm hover:bg-gray-50 transition-colors font-light font-futura-pt-light"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && returnToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-light text-black font-futura-pt-book">
                Cancel Return Request
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-black font-light font-futura-pt-light mb-4">
                Are you sure you want to cancel this return request? This action cannot be undone.
              </p>
              {returnToCancel.returnOrderNumber && (
                <p className="text-xs text-gray-600 font-light font-futura-pt-light mb-4">
                  Return Order: {returnToCancel.returnOrderNumber}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setReturnToCancel(null);
                }}
                className="px-6 py-2 border border-gray-200 text-black text-sm hover:bg-gray-50 transition-colors font-light font-futura-pt-light"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-900 transition-colors font-light font-futura-pt-light"
              >
                Yes, Cancel Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsPage;

