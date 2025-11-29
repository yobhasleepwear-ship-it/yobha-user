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
    id: "washes",
    prompt: "How many times has the item been washed?",
    options: [
      { label: "0–2 washes (Almost new)", value: "A", points: 3 },
      { label: "3–6 washes (Lightly used)", value: "B", points: 2 },
      { label: "7–12 washes (Used but okay)", value: "C", points: 1 },
      { label: "12+ washes (Heavily used)", value: "D", points: 0 },
    ],
  },
  {
    id: "stains",
    prompt: "Any visible stains or discoloration?",
    options: [
      { label: "None", value: "A", points: 3 },
      { label: "Very small / faint", value: "B", points: 2 },
      { label: "Noticeable but removable", value: "C", points: 1 },
      { label: "Large / permanent stains", value: "D", points: 0 },
    ],
  },
  {
    id: "damage",
    prompt: "Any damage such as holes, tears, or broken parts?",
    options: [
      { label: "No damage", value: "A", points: 3 },
      { label: "Minor repairable issue (small hole / loose thread)", value: "B", points: 2 },
      { label: "Broken zipper/buttons", value: "C", points: 1 },
      { label: "Large tear / burn / major damage", value: "D", points: 0 },
    ],
  },
  {
    id: "peeling",
    prompt: "Any peeling, cracking, or fabric coating damage?",
    options: [
      { label: "No peeling", value: "A", points: 3 },
      { label: "Light wear (no flakes)", value: "B", points: 2 },
      { label: "Small peeling/cracks", value: "C", points: 1 },
      { label: "Large peeling or delamination", value: "D", points: 0 },
    ],
  },
  {
    id: "tags",
    prompt: "Do the original tags/labels still exist?",
    options: [
      { label: "Tag & care label intact", value: "A", points: 3 },
      { label: "Tag faded but readable", value: "B", points: 2 },
      { label: "Partially missing tag", value: "C", points: 1 },
      { label: "Tag fully removed", value: "D", points: 0 },
    ],
  },
  {
    id: "altered",
    prompt: "Has the garment been altered or tailored?",
    options: [
      { label: "No alteration", value: "A", points: 3 },
      { label: "Minor hem adjustment", value: "B", points: 2 },
      { label: "Tailored/resized", value: "C", points: 1 },
      { label: "Altered significantly", value: "D", points: 0 },
    ],
  },
  {
    id: "customised",
    prompt: "Has the product been personalised/ customised (prints, embroidery, patches, initials etc.)?",
    options: [
      { label: "No customisation", value: "A", points: 3 },
      { label: "Small removable add-on (patch/badge)", value: "B", points: 2 },
      { label: "Minor custom embroidery/printing", value: "C", points: 1 },
      { label: "Heavy personalisation (names/initials/large prints)", value: "D", points: 0 },
    ],
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
  const [refundPercentage, setRefundPercentage] = useState(null);

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

  // Calculate total points from condition responses
  const calculatePoints = useMemo(() => {
    let totalPoints = 0;
    CONDITION_QUESTIONS.forEach((question) => {
      const selectedAnswer = conditionResponses[question.id];
      if (selectedAnswer) {
        const option = question.options.find((opt) => opt.value === selectedAnswer);
        if (option) {
          totalPoints += option.points;
        }
      }
    });
    return totalPoints;
  }, [conditionResponses]);

  // Determine condition and percentage based on points
  const getConditionDetails = useMemo(() => {
    if (calculatePoints >= 17 && calculatePoints <= 21) {
      return {
        condition: "Eligible (Good condition)",
        percentage: 20,
        eligible: true,
      };
    } else if (calculatePoints >= 12 && calculatePoints <= 16) {
      return {
        condition: "Minor repair check needed (Manual review)",
        percentage: 10,
        eligible: true,
      };
    } else {
      return {
        condition: "Not eligible",
        percentage: 0,
        eligible: false,
      };
    }
  }, [calculatePoints]);

  const conditionSummary = useMemo(
    () =>
      CONDITION_QUESTIONS.map((question) => {
        const selectedValue = conditionResponses[question.id];
        const selectedOption = question.options.find((opt) => opt.value === selectedValue);
        return {
          id: question.id,
          prompt: question.prompt,
          value: selectedOption ? `${selectedOption.value}. ${selectedOption.label}` : selectedValue,
          points: selectedOption ? selectedOption.points : 0,
        };
      }).filter((entry) => Boolean(entry.value)),
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
      const quiz = CONDITION_QUESTIONS.map((question) => {
        const selectedValue = conditionResponses[question.id];
        const selectedOption = question.options.find((opt) => opt.value === selectedValue);
        return {
          ques: question.prompt,
          ans: selectedOption ? selectedOption.label : (selectedValue || ""),
        };
      });

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
        // Calculate points and determine refund percentage
        let totalPoints = 0;
        CONDITION_QUESTIONS.forEach((question) => {
          const selectedAnswer = conditionResponses[question.id];
          if (selectedAnswer) {
            const option = question.options.find((opt) => opt.value === selectedAnswer);
            if (option) {
              totalPoints += option.points;
            }
          }
        });
        
        let percentage = 0;
        if (totalPoints >= 17 && totalPoints <= 21) {
          percentage = 20;
        } else if (totalPoints >= 12 && totalPoints <= 16) {
          percentage = 10;
        }
        
        setRefundPercentage(percentage);
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
              <h1 className="text-2xl md:text-3xl font-light text-black leading-tight font-futura-pt-book">
                Condition Check
              </h1>
              <p className="mt-4 text-sm text-black font-light font-futura-pt-light">
                Please answer the questions below and upload product images for your buyback request.
              </p>
            </div>

            {/* Order Summary */}
            <div className="mb-8 border-2 border-gray-300 bg-white px-4 py-5 md:px-5 md:py-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-black" strokeWidth={1.5} />
                <p className="text-sm text-black font-light font-futura-pt-book">
                  Order Information
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-base font-light text-black font-futura-pt-light">
                  <span className="font-futura-pt-book">Order ID:</span> {order.id || order.orderNo}
                </p>
                {selectedItem && (
                  <>
                    <p className="text-base font-light text-black font-futura-pt-light">
                      <span className="font-futura-pt-book">Product:</span> {selectedItem.productName || "N/A"}
                    </p>
                    <p className="text-base font-light text-black font-futura-pt-light">
                      <span className="font-futura-pt-book">Product ID:</span> {selectedItem.productId || "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Condition Questions */}
            <div className="space-y-6 mb-8">
              <h2 className="text-base md:text-lg font-light text-black mb-4 font-futura-pt-book">
                Condition Assessment
              </h2>
              {CONDITION_QUESTIONS.map((question, idx) => (
                <div
                  key={question.id}
                  className="space-y-3"
                >
                  <p className="text-sm md:text-base text-black mb-3 font-light font-futura-pt-book">
                    {idx + 1}. {question.prompt}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = conditionResponses[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleConditionChange(question.id, option.value)}
                          className={`w-full text-left border-2 px-4 py-3 text-xs md:text-sm transition-colors font-light font-futura-pt-light ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-gray-300 bg-white text-black hover:border-black"
                          }`}
                        >
                          <span className="font-futura-pt-book font-light mr-2">{option.value}.</span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Product Images Upload */}
            <div className="mb-8">
              <h2 className="text-base md:text-lg font-light text-black mb-4 font-futura-pt-book">
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
                    <p className="text-xs text-black mb-2 font-light font-futura-pt-light">
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
                className={`px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm transition-all duration-300 font-light flex items-center gap-2 font-futura-pt-light ${
                  canSubmit && !isSubmitting
                    ? "border-2 border-black bg-black text-white hover:bg-gray-900"
                    : "border-2 border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
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
            <p className="text-[10px] md:text-xs text-white/70 mb-6 font-light text-center font-futura-pt-light">Completion</p>
            <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8 text-center font-futura-pt-book">
              Thank you for extending the life of your YOBHA garment.
            </h2>
            {refundPercentage !== null && refundPercentage > 0 && (
              <div className="mb-8 text-center">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white font-futura-pt-light mb-2">
                  Refund Percentage
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white font-futura-pt-book">
                  Upto {refundPercentage}%
                </p>
              </div>
            )}
            {refundPercentage === 0 && (
              <div className="mb-8 text-center">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white font-futura-pt-light mb-2">
                  Refund Percentage
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white font-futura-pt-book">
                  No credit
                </p>
              </div>
            )}
            <p className="max-w-2xl mx-auto text-sm md:text-base lg:text-lg leading-[1.8] text-white/80 font-light mb-12 text-center font-futura-pt-light">
              Your contribution supports circular luxury and conscious comfort.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="border-2 border-white px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm text-white transition-all duration-300 hover:bg-white hover:text-black font-light font-futura-pt-light"
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

