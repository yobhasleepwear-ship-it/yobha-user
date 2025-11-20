import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { createBuyback } from "../../service/buyback";
import { message } from "../../comman/toster-message/ToastContainer";
import ImageUploader from "../../comman/Image-Uploader/ImageUploader";

const CONDITION_QUESTIONS = [
  {
    id: "clean",
    prompt: "Is it clean and wearable?",
    options: ["Yes", "Slightly used", "Needs minor repair"],
  },
  {
    id: "damage",
    prompt: "Any visible stains or damage?",
    options: ["None", "Minor", "Major"],
  },
  {
    id: "tag",
    prompt: "Does it still have YOBHA tag/label?",
    options: ["Yes", "Faded", "Missing"],
  },
  {
    id: "fastening",
    prompt: "Are all zippers/buttons fine?",
    options: ["Yes", "Few issues", "Broken"],
  },
];

const BuybackFromOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, selectedOption, selectedItem } = location.state || {};

  const [conditionResponses, setConditionResponses] = useState({});
  const [productImages, setProductImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);

  // Redirect if no order data
  useEffect(() => {
    if (!order || !selectedOption) {
      navigate("/orders");
    }
  }, [order, selectedOption, navigate]);

  const allConditionsAnswered = useMemo(
    () => CONDITION_QUESTIONS.every((question) => conditionResponses[question.id]),
    [conditionResponses]
  );

  const conditionSummary = useMemo(
    () =>
      CONDITION_QUESTIONS.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        value: conditionResponses[question.id],
      })).filter((entry) => Boolean(entry.value)),
    [conditionResponses]
  );

  const handleConditionChange = (questionId, answer) => {
    setConditionResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleProductImageUpload = (results) => {
    const allImages = [...productImages, ...results];
    if (allImages.length > 4) {
      setProductImages(allImages.slice(0, 4));
      message.error("You can upload only 4 product images.");
    } else {
      setProductImages(allImages);
    }
  };

  const getRequestType = (optionId) => {
    switch (optionId) {
      case "credit":
        return "TradeIn";
      case "repair":
        return "RepairReuse";
      case "recycle":
        return "Recycle";
      default:
        return "TradeIn";
    }
  };

  const getCountry = () => {
    try {
      const saved = window.localStorage.getItem("selectedCountry");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.code || "IN";
      }
    } catch (error) {
      console.error("Unable to parse saved country", error);
    }
    return "IN";
  };

  const handleSubmit = async () => {
    if (!allConditionsAnswered) {
      setSubmitError("Please answer all condition questions.");
      return;
    }

    if (productImages.length === 0) {
      setSubmitError("Please upload at least one product image.");
      return;
    }

    if (productImages.length > 4) {
      setSubmitError("You can upload maximum 4 product images.");
      return;
    }

    if (!selectedItem?.productId) {
      setSubmitError("Product ID is required.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Map condition responses to quiz format
      const quiz = CONDITION_QUESTIONS.map((question) => ({
        ques: question.prompt,
        ans: conditionResponses[question.id] || "",
      }));

      const payload = {
        orderId: order?.id || order?.orderNo || null,
        productId: selectedItem?.productId || "",
        productUrl: productImages.map((img) => (typeof img === 'string' ? img : img.url)),
        invoiceUrl: "", // Not required when orderId is present
        country: getCountry(),
        quiz: quiz,
        requestType: getRequestType(selectedOption),
        currency: "INR",
      };

      // Call API
      const response = await createBuyback(payload);
      
      if (response) {
        message.success("Buyback request submitted successfully!");
        setShowCompletion(true);
      }
    } catch (error) {
      console.error("Error submitting buyback request:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit buyback request. Please try again.";
      setSubmitError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order || !selectedOption) {
    return null;
  }

  const canSubmit = allConditionsAnswered && productImages.length > 0 && productImages.length <= 4 && selectedItem?.productId;

  return (
    <div className="min-h-screen bg-white font-futura-pt-light antialiased">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 md:py-8 lg:py-10">
        {!showCompletion ? (
          <>
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-4 font-light"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back to Orders
              </button>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light uppercase tracking-[0.1em] text-black leading-tight">
                Condition Check
              </h1>
              <p className="mt-4 text-sm text-gray-600 font-light">
                Please answer the questions below and upload product images for your buyback request.
              </p>
            </div>

            {/* Order Summary */}
            <div className="mb-8 border-2 border-gray-300 bg-white px-4 py-5 md:px-5 md:py-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-black" strokeWidth={1.5} />
                <p className="text-sm uppercase tracking-[0.2em] text-black font-light" style={{ fontWeight: '400' }}>
                  Order Information
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-light text-black">
                  <span className="font-medium">Order ID:</span> {order.id || order.orderNo}
                </p>
                {selectedItem && (
                  <>
                    <p className="text-sm font-light text-black">
                      <span className="font-medium">Product:</span> {selectedItem.productName || "N/A"}
                    </p>
                    <p className="text-sm font-light text-black">
                      <span className="font-medium">Product ID:</span> {selectedItem.productId || "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Condition Questions */}
            <div className="space-y-4 mb-8">
              <h2 className="text-lg md:text-xl font-light uppercase tracking-[0.1em] text-black mb-4">
                Condition Assessment
              </h2>
              {CONDITION_QUESTIONS.map((question, idx) => (
                <div
                  key={question.id}
                  className="space-y-2 border-2 border-gray-200 bg-white p-4"
                >
                  <p className="text-sm text-gray-700 mb-2 font-light" style={{ fontWeight: '300' }}>
                    {question.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const isSelected = conditionResponses[question.id] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleConditionChange(question.id, option)}
                          className={`border px-3 py-1.5 text-xs transition-colors font-light ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white text-black hover:border-black"
                          }`}
                          style={{ fontWeight: '300' }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Product Images Upload */}
            <div className="mb-8">
              <h2 className="text-lg md:text-xl font-light uppercase tracking-[0.1em] text-black mb-4">
                Product Images (Max 4)
              </h2>
              <div className="border-2 border-gray-200 bg-white p-4">
                <ImageUploader
                  productId={selectedItem?.productId || `product_${Date.now()}`}
                  onUploadComplete={handleProductImageUpload}
                  hideUploadedDisplay={true}
                />
                {productImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2 font-light">
                      Uploaded ({productImages.length}/4)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative border border-gray-200 overflow-hidden">
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 w-full border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 font-light flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm uppercase tracking-[0.2em] transition-all duration-300 font-light flex items-center gap-2 ${
                  canSubmit && !isSubmitting
                    ? "border-2 border-black bg-black text-white hover:bg-gray-900"
                    : "border-2 border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
                style={{ fontWeight: '400' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Buyback Request
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Completion Screen */
          <section className="mt-16 border border-black bg-black px-10 py-16 md:px-20 md:py-20 text-white animate-fadeIn shadow-2xl">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/70 mb-6 font-light text-center">Completion</p>
            <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-light uppercase tracking-[0.08em] leading-tight mb-8 text-center">
              Thank you for extending the life of your YOBHA piece.
            </h2>
            <p className="max-w-2xl mx-auto text-sm md:text-base lg:text-lg leading-[1.8] text-white/80 font-light mb-12 tracking-wide text-center">
              Your contribution supports circular luxury and conscious comfort.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="border-2 border-white px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black font-light"
                style={{ fontWeight: '400' }}
              >
                Back to Orders
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BuybackFromOrder;

