import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Wrench,
  Recycle,
  ChevronRight,
  Check,
  CheckCircle2,
  ArrowLeft,
  Package,
  Image as ImageIcon,
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  Clock,
  Mail,
  Globe,
  RotateCcw,
  FileText,
} from "lucide-react";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import { getOrders } from "../../service/order";
import { createBuyback } from "../../service/buyback";
import { message } from "../../comman/toster-message/ToastContainer";
import ImageUploader from "../../comman/Image-Uploader/ImageUploader";
import * as localStorageService from "../../service/localStorageService";

const STEPS = [
  { id: 1, title: "Choose Your Option" },
  { id: 2, title: "Select Method" },
  { id: 3, title: "Order Details" },
  { id: 4, title: "Condition Check" },
  { id: 5, title: "Confirm" },
];

const TRADE_IN_OPTIONS = [
  {
    id: "credit",
    title: "Trade-in for Credit",
    description: "Return your YOBHA garment and earn Care Credit.",
    icon: CreditCard,
  },
  {
    id: "repair",
    title: "Repair & Reuse",
    description: "We'll fix and send it back to you.",
    icon: Wrench,
  },
  {
    id: "recycle",
    title: "Recycle",
    description: "Let us recycle it responsibly.",
    icon: Recycle,
  },
];

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

const Buyback3 = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [conditionResponses, setConditionResponses] = useState({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [stepAnimation, setStepAnimation] = useState("fadeIn");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderMethod, setOrderMethod] = useState(null); // "findOrder" or "noOrderId"
  const [refundPercentage, setRefundPercentage] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [productImages, setProductImages] = useState([]); // Max 4 images
  const [productId, setProductId] = useState("");
  const hasFetchedOrdersRef = useRef(false);
  const prevStepRef = useRef(1);
  const prevAuthRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    const token = window.localStorage.getItem(LocalStorageKeys.AuthToken);
    const isAuth = Boolean(token && token !== "undefined" && token !== "null");
    if (isAuth) {
      setIsAuthenticated(true);
    }
    prevAuthRef.current = isAuth;

    const handleStorage = (event) => {
      if (event.key === LocalStorageKeys.AuthToken) {
        const nextToken = event.newValue;
        const isAuth = Boolean(nextToken && nextToken !== "undefined" && nextToken !== "null");
        setIsAuthenticated(isAuth);
        if (!isAuth) {
          setOrders([]);
        } else {
          // User just logged in, redirect to step 2 if we have selected option
          const returnPath = localStorageService.getValue("redirectAfterLogin");
          const savedOption = localStorageService.getValue("selectedBuybackOption");
          if (returnPath && typeof returnPath === "string" && returnPath.includes("/buyback") && activeStep === 1 && (selectedOptionId || savedOption)) {
            if (savedOption) {
              setSelectedOptionId(savedOption);
              localStorageService.removeValue("selectedBuybackOption");
            }
            localStorageService.removeValue("redirectAfterLogin");
            setStepAnimation("slideOut");
            setTimeout(() => {
              setActiveStep(2);
              setStepAnimation("slideIn");
            }, 300);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Check if returning from login page - restore saved option and advance to step 2
  useEffect(() => {
    const savedOption = localStorageService.getValue("selectedBuybackOption");
    const token = window.localStorage.getItem(LocalStorageKeys.AuthToken);
    const isAuth = Boolean(token && token !== "undefined" && token !== "null");
    
    // If user is authenticated, on step 1, and has a saved option from login redirect
    if (isAuth && activeStep === 1 && location.pathname === "/buyback" && savedOption && !selectedOptionId) {
      setSelectedOptionId(savedOption);
      setIsAuthenticated(true);
      localStorageService.removeValue("selectedBuybackOption");
      setStepAnimation("slideOut");
      setTimeout(() => {
        setActiveStep(2);
        setStepAnimation("slideIn");
      }, 300);
    }
  }, [activeStep, location.pathname, selectedOptionId]);

  // Fetch orders only when step 3 is reached with "findOrder" method and user is authenticated
  useEffect(() => {
    // Reset ref when leaving step 3
    if (activeStep !== 3) {
      hasFetchedOrdersRef.current = false;
    }
    
    // Fetch when transitioning to step 3 with findOrder method or when user logs in while on step 3
    const transitioningToStep3 = activeStep === 3 && prevStepRef.current !== 3;
    const loggedInOnStep3 = activeStep === 3 && isAuthenticated && prevAuthRef.current !== isAuthenticated;
    const shouldFetch = (transitioningToStep3 || loggedInOnStep3) && 
                        isAuthenticated && 
                        orderMethod === "findOrder" && 
                        !hasFetchedOrdersRef.current && 
                        !isLoadingOrders;
    
    if (shouldFetch) {
      hasFetchedOrdersRef.current = true;
      fetchOrders();
    }
    
    prevStepRef.current = activeStep;
    prevAuthRef.current = isAuthenticated;
  }, [activeStep, isAuthenticated, isLoadingOrders, orderMethod]);

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await getOrders();
      setOrders(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Helper functions - defined before useMemo hooks
  const getPurchaseDateLabel = (dateStr) => {
    if (!dateStr) return "All";
    const date = new Date(dateStr);
    const now = new Date();
    const monthsDiff = (now - date) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff <= 6) return "Last 6 Months";
    if (monthsDiff <= 12) return "Last 12 Months";
    if (date.getFullYear() === 2023) return "2023 Purchases";
    return "Older";
  };

  const getHueForItem = (idx) => {
    const hues = [
      "from-[#f5f2ed] to-[#dfd9d1]",
      "from-[#efefef] to-[#d7d7d7]",
      "from-[#f6f2ea] to-[#e5d9c7]",
      "from-[#f4f5f7] to-[#dfe3ea]",
      "from-[#f2f6f5] to-[#d8e3e1]",
      "from-[#f4ece2] to-[#e4d1bb]",
    ];
    return hues[idx % hues.length];
  };

  // Transform orders to match the expected format
  const transformedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    return orders.map((order) => {
      const items = order.items || [];
      const firstItem = items[0] || {};
      
      return {
        id: order.orderNo || order.id,
        orderNumber:order.orderNumber,
        placedOn: order.createdAt,
        category: firstItem.category || "General",
        collection: firstItem.collection || "Standard",
        purchaseDateLabel: getPurchaseDateLabel(order.createdAt),
        items: items.map((item, idx) => ({
          id: item.productId || `item-${idx}`,
          name: item.productName || "Product",
          image: item.thumbnailUrl || item.productImage || item.image || item.thumbnail,
          size: item.size || "Standard",
          hue: getHueForItem(idx),
        })),
        thumbnailUrl: firstItem.thumbnailUrl || firstItem.productImage || firstItem.image || firstItem.thumbnail,
      };
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return transformedOrders;
  }, [transformedOrders]);

  const allConditionsAnswered = useMemo(
    () => CONDITION_QUESTIONS.every((question) => conditionResponses[question.id]),
    [conditionResponses]
  );

  const selectedOption = useMemo(
    () => TRADE_IN_OPTIONS.find((option) => option.id === selectedOptionId) || null,
    [selectedOptionId]
  );

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

  const handleOptionSelect = (optionId) => {
    // Check if this is a new selection (option is changing)
    const isNewSelection = selectedOptionId !== optionId;
    
    // Always update the option selection
    setSelectedOptionId(optionId);
    
    // Check if user is authenticated
    const token = window.localStorage.getItem(LocalStorageKeys.AuthToken);
    const isAuth = Boolean(token && token !== "undefined" && token !== "null");
    
    if (!isAuth) {
      // Save state for redirect after login
      localStorageService.setValue("redirectAfterLogin", location.pathname);
      localStorageService.setValue("selectedBuybackOption", optionId);
      // Don't navigate immediately - let the UI show the login message
      return;
    }
    
    setIsAuthenticated(true);
    
    // Only auto-advance if this is a new selection
    // If the option is already selected (user navigating back), preserve state
    // and let them use the Continue button instead
    if (isNewSelection) {
      setStepAnimation("slideOut");
      setTimeout(() => {
        setActiveStep(2);
        setHighestStep((prev) => Math.max(prev, 2));
        setStepAnimation("slideIn");
      }, 300);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleOrderSelect = (orderId) => {
    const order = transformedOrders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setSelectedItem(null);
      setOrderConfirmed(false);
      setDropdownOpen(false);
    }
  };

  const handleOrderMethodSelect = (method) => {
    // Check if this is a new selection (method is changing)
    const isNewSelection = orderMethod !== method;
    
    // Always update the method selection
    setOrderMethod(method);
    
    // Only auto-advance if this is a new selection
    // If the method is already selected (user navigating back), preserve state
    // and let them use the Continue button instead
    if (isNewSelection) {
      setStepAnimation("slideOut");
      setTimeout(() => {
        setActiveStep(3);
        setHighestStep((prev) => Math.max(prev, 3));
        setStepAnimation("slideIn");
      }, 300);
    }
  };


  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setProductId(item.id || "");
    // Auto proceed to step 4 after selecting item
    setStepAnimation("slideOut");
    setTimeout(() => {
      setActiveStep(4);
      setHighestStep((prev) => Math.max(prev, 4));
      setStepAnimation("slideIn");
    }, 300);
  };

  const handleInvoiceUpload = (results) => {
    if (results && results.length > 0) {
      setInvoiceUrl(results[0].url);
    }
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

  const handleConditionChange = (questionId, answer) => {
    setConditionResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

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

  const handleBack = () => {
    setStepAnimation("slideOut");
    setTimeout(() => {
      setActiveStep((prev) => Math.max(1, prev - 1));
      setStepAnimation("slideIn");
    }, 300);
  };

  const handleContinue = () => {
    if (!isContinueEnabled) return;
    
    setStepAnimation("slideOut");
    setTimeout(() => {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      setHighestStep((prev) => Math.max(prev, nextStep));
      setStepAnimation("slideIn");
    }, 300);
  };

  const handleStepClick = (targetStep) => {
    // Allow navigation to any step that has been reached before (up to highestStep)
    // This allows users to go back and then jump forward to any previously visited step
    if (targetStep > highestStep) return;
    
    // Preserve all selections when navigating - don't clear any state
    setStepAnimation("slideOut");
    setTimeout(() => {
      setActiveStep(targetStep);
      setStepAnimation("slideIn");
    }, 300);
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

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
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

      // Validate product images
      if (productImages.length === 0) {
        throw new Error("Please upload at least one product image.");
      }

      if (productImages.length > 4) {
        throw new Error("You can upload maximum 4 product images.");
      }

      // Build payload based on orderMethod
      // If orderId exists, invoiceUrl should be null
      // If no orderId, invoiceUrl should be set
      const hasOrderId = selectedOrder?.id && orderMethod === "findOrder";
      const payload = {
        orderId: hasOrderId ? selectedOrder.id : null,
        productId: productId || selectedItem?.id || "",
        productUrl: productImages.map((img) => (typeof img === 'string' ? img : img.url)),
        invoiceUrl: !hasOrderId && invoiceUrl ? invoiceUrl : "",
        country: getCountry(),
        quiz: quiz,
        requestType: getRequestType(selectedOptionId),
        currency: "INR",
      };

      // Validate required fields
      if (!payload.productId) {
        throw new Error("Product ID is required");
      }

      if (!payload.productUrl || payload.productUrl.length === 0) {
        throw new Error("Product images are required");
      }

      // If no order ID, invoice is required
      if (!hasOrderId && !invoiceUrl) {
        throw new Error("Invoice/Bill is required when Order ID is not available");
      }

      // Call API
      const response = await createBuyback(payload);
      
      if (response) {
        // Store refund percentage before showing completion
        setRefundPercentage(getConditionDetails.percentage);
        message.success("Buyback request submitted successfully!");
        setHighestStep((prev) => Math.max(prev, 5));
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

  const handleReset = () => {
    setActiveStep(1);
    setHighestStep(1);
    setSelectedOptionId(null);
    setSelectedOrder(null);
    setSelectedItem(null);
    setConditionResponses({});
    setShowCompletion(false);
    setRefundPercentage(null);
    setStepAnimation("fadeIn");
    setOrderConfirmed(false);
    setSubmitError(null);
    setIsSubmitting(false);
    setDropdownOpen(false);
    setOrderMethod(null);
    setInvoiceUrl("");
    setProductImages([]);
    setProductId("");
    hasFetchedOrdersRef.current = false;
  };

  const canConfirm =
    Boolean(selectedOption) &&
    allConditionsAnswered &&
    productImages.length > 0 &&
    productImages.length <= 4 &&
    ((orderMethod === "findOrder" && selectedItem) || (orderMethod === "noOrderId" && invoiceUrl && productId));

  const isContinueEnabled = useMemo(() => {
    switch (activeStep) {
      case 1:
        return Boolean(selectedOptionId && isAuthenticated);
      case 2:
        return Boolean(orderMethod);
      case 3:
        if (orderMethod === "findOrder") {
          return Boolean(selectedOrder && selectedItem);
        } else if (orderMethod === "noOrderId") {
          return Boolean(invoiceUrl);
        }
        return false;
      case 4:
        return allConditionsAnswered && productImages.length > 0 && productImages.length <= 4;
      default:
        return false;
    }
  }, [activeStep, selectedOptionId, isAuthenticated, selectedOrder, selectedItem, allConditionsAnswered, orderMethod, invoiceUrl, productId, productImages.length]);

  const renderStepContent = () => {
    const animationClass =
      stepAnimation === "slideIn"
        ? "animate-slideIn"
        : stepAnimation === "slideOut"
        ? "animate-slideOut"
        : "animate-fadeIn";

    switch (activeStep) {
      case 1:
        return (
          <div className={`space-y-6 md:space-y-8 ${animationClass}`}>
            <div>
              <div className="text-center mb-6 md:mb-8">
                <p className="text-sm md:text-sm lg:text-sm sm:text-xs text-black font-light mb-2 font-futura-pt-light">Step 1</p>
                <h2 className="text-lg md:text-lg lg:text-lg sm:text-md text-black leading-tight font-futura-pt-book font-light">
                  Choose Your Option
                </h2>
              </div>
            </div>
            {/* Consistent Card Layout - Same Structure for All */}
            <div className="grid gap-4 md:gap-5 md:grid-cols-3 mt-8 md:mt-10">
              {TRADE_IN_OPTIONS.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`group relative flex flex-col items-center justify-between text-center px-4 py-6 md:px-5 md:py-7 transition-all duration-300 h-full ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-white border-2 border-gray-300 hover:border-black text-black"
                    }`}
                    style={{ height: '240px' }}
                  >
                    {/* Icon - Always Top, Same Size */}
                    <div className={`mb-4 transition-colors flex-shrink-0 ${
                      isSelected ? "text-white" : "text-black"
                    }`}>
                      <IconComponent className="w-12 h-12 md:w-14 md:h-14 stroke-[1.2]" />
                    </div>
                    
                    {/* Title - Always Below Icon, Same Size */}
                    <h3
                      className={`text-base md:text-lg lg:text-xl mb-3 transition-colors leading-tight flex-shrink-0 font-futura-pt-book font-light ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {option.title}
                    </h3>
                    
                    {/* Description - Always Bottom, Same Size */}
                    <p
                      className={`text-xs md:text-sm leading-relaxed transition-colors mt-auto text-center flex-shrink-0 font-light font-futura-pt-light ${
                        isSelected ? "text-white/90" : "text-black"
                      }`}
                    >
                      {option.description}
                    </p>
                    
                    {/* Selected Indicator - Top Right */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center bg-white/20">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Show login message if option selected but not authenticated */}
            {selectedOptionId && !isAuthenticated && (
              <div className="mt-6 md:mt-8 px-6 py-6 md:px-8 md:py-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book font-light">
                  Please login to continue
                </p>
                <p className="mt-2 max-w-xl mx-auto text-sm leading-relaxed text-black font-light mb-6 font-futura-pt-light">
                  You need to be logged in to proceed with your buyback request.
                </p>
                <button
                  onClick={handleLoginRedirect}
                  className="inline-flex items-center gap-2 border-2 border-black px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm text-black transition-all duration-300 hover:bg-black hover:text-white font-light group font-futura-pt-light"
                >
                  Go to Login
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className={`space-y-6 md:space-y-8 ${animationClass}`}>
            <div>
              <div className="text-center mb-6 md:mb-8">
                <p className="text-sm md:text-sm lg:text-sm sm:text-xs text-black font-light mb-2 font-futura-pt-light">Step 2</p>
                <h2 className="text-lg md:text-lg lg:text-lg sm:text-md text-black leading-tight font-futura-pt-book font-light">
                  Select Method
                </h2>
              </div>
            </div>
            {!isAuthenticated ? (
              <div className="border-2 border-gray-300 bg-white px-6 py-10 md:px-8 md:py-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book font-light">
                  Sign in to continue
                </p>
                <p className="mt-2 max-w-xl mx-auto text-sm leading-relaxed text-black font-light mb-6 font-futura-pt-light">
                  Your current progress remains saved. Once authenticated, you can proceed with your buyback request.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border-2 border-black px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm text-black transition-all duration-300 hover:bg-black hover:text-white font-light group font-futura-pt-light"
                >
                  Go to login
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-5 md:grid-cols-2 mt-8 md:mt-10">
                <button
                  type="button"
                  onClick={() => handleOrderMethodSelect("findOrder")}
                  className={`group relative flex flex-col items-center justify-between text-center px-4 py-6 md:px-5 md:py-7 transition-all duration-300 h-full ${
                    orderMethod === "findOrder"
                      ? "bg-black text-white border-2 border-black"
                      : "bg-white border-2 border-gray-300 hover:border-black text-black"
                  }`}
                  style={{ height: '240px' }}
                >
                  <div className={`mb-4 transition-colors flex-shrink-0 ${
                    orderMethod === "findOrder" ? "text-white" : "text-black"
                  }`}>
                    <Package className="w-12 h-12 md:w-14 md:h-14 stroke-[1.2]" />
                  </div>
                  <h3
                    className={`text-base md:text-lg lg:text-xl mb-3 transition-colors leading-tight flex-shrink-0 font-futura-pt-book font-light ${
                      orderMethod === "findOrder" ? "text-white" : "text-black"
                    }`}
                  >
                    Find Your Order
                  </h3>
                  <p
                    className={`text-xs md:text-sm leading-relaxed transition-colors mt-auto text-center flex-shrink-0 font-light font-futura-pt-light ${
                      orderMethod === "findOrder" ? "text-white/90" : "text-black"
                    }`}
                  >
                    Select from your order history
                  </p>
                  {orderMethod === "findOrder" && (
                    <div className="absolute top-3 right-3 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center bg-white/20">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOrderMethodSelect("noOrderId")}
                  className={`group relative flex flex-col items-center justify-between text-center px-4 py-6 md:px-5 md:py-7 transition-all duration-300 h-full ${
                    orderMethod === "noOrderId"
                      ? "bg-black text-white border-2 border-black"
                      : "bg-white border-2 border-gray-300 hover:border-black text-black"
                  }`}
                  style={{ height: '240px' }}
                >
                  <div className={`mb-4 transition-colors flex-shrink-0 ${
                    orderMethod === "noOrderId" ? "text-white" : "text-black"
                  }`}>
                    <FileText className="w-12 h-12 md:w-14 md:h-14 stroke-[1.2]" />
                  </div>
                  <h3
                    className={`text-base md:text-lg lg:text-xl mb-3 transition-colors leading-tight flex-shrink-0 font-futura-pt-book font-light ${
                      orderMethod === "noOrderId" ? "text-white" : "text-black"
                    }`}
                  >
                    Don't Have Order ID
                  </h3>
                  <p
                    className={`text-xs md:text-sm leading-relaxed transition-colors mt-auto text-center flex-shrink-0 font-light font-futura-pt-light ${
                      orderMethod === "noOrderId" ? "text-white/90" : "text-black"
                    }`}
                  >
                    Upload invoice or bill instead
                  </p>
                  {orderMethod === "noOrderId" && (
                    <div className="absolute top-3 right-3 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center bg-white/20">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className={`space-y-6 md:space-y-8 ${animationClass}`}>
            <div>
              <div className="text-center mb-6 md:mb-8">
                <p className="text-sm md:text-sm lg:text-sm sm:text-xs text-black font-light mb-2 font-futura-pt-light">Step 3</p>
                <h2 className="text-lg md:text-lg lg:text-lg sm:text-md text-black leading-tight font-futura-pt-book font-light">
                  {orderMethod === "findOrder" ? "Find Your Order" : "Upload Invoice/Bill"}
                </h2>
              </div>
            </div>
            {orderMethod === "findOrder" ? (
              <>
                <div className="space-y-4 md:space-y-5">
                  {/* Order Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-black font-light flex items-center gap-2 mb-2 font-futura-pt-book">
                      <Package className="w-4 h-4" strokeWidth={2} />
                      Select Your Order
                    </label>
                    {isLoadingOrders ? (
                      <div className="border-2 border-gray-300 bg-white px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" strokeWidth={1.5} />
                        <p className="text-sm text-black font-light font-futura-pt-light">Loading orders...</p>
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="border-2 border-gray-300 bg-white px-6 py-8 text-center">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" strokeWidth={1.5} />
                        <p className="text-sm text-black font-light font-futura-pt-light">No orders available.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className={`w-full border-2 bg-white px-4 py-3 md:py-3.5 text-left text-sm text-black focus:outline-none font-light transition-all duration-300 flex items-center justify-between ${
                            dropdownOpen 
                              ? "border-black" 
                              : "border-gray-400 hover:border-black"
                          }`}
                        >
                          <span className="truncate flex items-center gap-3">
                            {selectedOrder ? (
                              <>
                                {(selectedOrder.thumbnailUrl || selectedOrder.items[0]?.image) ? (
                                  <img
                                    src={selectedOrder.thumbnailUrl || selectedOrder.items[0]?.image}
                                    alt={selectedOrder.items[0]?.name || "Order"}
                                    className="w-10 h-10 object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                                  </div>
                                )}
                                <span className="text-black">
                                  {selectedOrder.id} - {selectedOrder.items[0]?.name || "Order"}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">Select an order...</span>
                            )}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                            strokeWidth={2}
                          />
                        </button>
                        {dropdownOpen && (
                          <div className="relative w-full mt-2 bg-white border-2 border-gray-300 shadow-2xl h-80 overflow-y-auto scrollbar-hide z-50">
                              {filteredOrders.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                  <p className="text-sm text-gray-500 font-light">No orders found</p>
                                </div>
                              ) : (
                                filteredOrders.map((order) => {
                                  const firstItem = order.items[0] || {};
                                  const isSelected = selectedOrder?.id === order.id;
                                  const orderImage = order.thumbnailUrl || firstItem.image;
                                  return (
                                    <button
                                      key={order.id}
                                      type="button"
                                      onClick={() => {
                                        handleOrderSelect(order.id);
                                        setDropdownOpen(false);
                                      }}
                                      className={`w-full px-5 py-5 text-left transition-all duration-200 flex items-center gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                                        isSelected ? "bg-gray-50 border-l-2 border-l-black" : ""
                                      }`}
                                    >
                                    <div className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gradient-to-br ${firstItem.hue || "from-gray-100 to-gray-200"} overflow-hidden rounded-sm border border-gray-100`}>
                                      {orderImage ? (
                                        <img
                                          src={orderImage}
                                          alt={firstItem.name || "Order"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-light">
                                          No Image
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm md:text-base text-black font-light leading-tight mb-1 font-futura-pt-book">
                                        {order.orderNumber}
                                      </p>
                                      <p className="text-xs md:text-sm text-black font-light truncate font-futura-pt-light">
                                        {firstItem.name || "Order"}
                                      </p>
                                      <p className="text-xs text-black font-light mt-1 font-futura-pt-light">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </p>
                                    </div>
                                    {isSelected && (
                                      <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center flex-shrink-0 bg-black">
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                      </div>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Details Display */}
                  {selectedOrder && !orderConfirmed && (
                    <div className="animate-fadeIn transition-all duration-200">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="w-4 h-4 text-black" strokeWidth={1.5} />
                          <p className="text-sm text-black font-light font-futura-pt-book">
                            Order Details
                          </p>
                        </div>
                        <h3 className="text-base md:text-lg mb-2 font-light text-black leading-tight font-futura-pt-book">
                          {selectedOrder.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-black font-light mb-4 font-futura-pt-light">
                          <Calendar className="w-4 h-4" strokeWidth={1.5} />
                          <span>
                            Placed on{" "}
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(selectedOrder.placedOn))}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Filter className="w-4 h-4 text-black" strokeWidth={1.5} />
                          <p className="text-sm text-black font-light font-futura-pt-book">
                            Items in this order ({selectedOrder.items.length})
                          </p>
                        </div>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item) => {
                            const isSelected = selectedItem?.id === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleItemSelect(item)}
                                className={`w-full flex items-center gap-3 md:gap-4 py-3 px-2 transition-all duration-200 text-left ${
                                  isSelected ? "bg-black text-white" : "hover:bg-gray-50"
                                }`}
                              >
                                <div className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gradient-to-br ${item.hue} overflow-hidden rounded-sm`}>
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-xs font-light ${
                                      isSelected ? "text-white/70" : "text-gray-300"
                                    }`}>
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm md:text-base font-light leading-tight mb-1 truncate font-futura-pt-book ${
                                      isSelected ? "text-white" : "text-black"
                                    }`}
                                  >
                                    {item.name}
                                  </p>
                                  <p
                                    className={`text-xs font-light ${isSelected ? "text-white/90" : "text-black"} font-futura-pt-light`}
                                  >
                                    Size: {item.size}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-white flex-shrink-0" strokeWidth={3} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : orderMethod === "noOrderId" ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-black mb-3 font-light font-futura-pt-light">
                    Upload Invoice / Bill
                  </p>
                  <ImageUploader
                    productId={`${productId || "invoice"}_${Date.now()}`}
                    onUploadComplete={handleInvoiceUpload}
                  />
                  {invoiceUrl && (
                    <p className="mt-3 text-xs text-gray-600 font-light font-futura-pt-light">
                      Invoice uploaded.{" "}
                      <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-black mb-2 block font-light font-futura-pt-light">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter Product ID"
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-black font-light"
                  />
                </div>
              </div>
            ) : null}
          </div>
        );
      case 4:
        return (
          <div className={`space-y-6 md:space-y-8 ${animationClass}`}>
            <div>
              <div className="text-center mb-6 md:mb-8">
                <p className="text-sm md:text-sm lg:text-sm sm:text-xs text-black font-light mb-2 font-futura-pt-light">Step 4</p>
                <h2 className="text-lg md:text-lg lg:text-lg sm:text-md text-black leading-tight font-futura-pt-book font-light">
                  Condition Check
                </h2>
              </div>
            </div>
            {((orderMethod === "findOrder" && !selectedItem) || (orderMethod === "noOrderId" && !invoiceUrl)) ? (
              <div className="border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                <p className="text-sm text-black font-light font-futura-pt-light">
                  {orderMethod === "findOrder"
                    ? "Select an item in Step 3 to begin the condition check."
                    : "Complete Step 3 to begin the condition check."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Condition Questions */}
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

                {/* Points and Condition Display */}

                {/* Product Images Upload */}
                <div>
                  <p className="text-sm text-black mb-3 font-light font-futura-pt-light">
                    Upload Product Images (Max 4)
                  </p>
                  <ImageUploader
                    productId={productId || selectedItem?.id || `product_${Date.now()}`}
                    onUploadComplete={handleProductImageUpload}
                    hideUploadedDisplay={true}
                  />
                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2 font-light font-futura-pt-light">
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
            )}
          </div>
        );
      case 5:
        return (
          <div className={`space-y-6 md:space-y-8 ${animationClass}`}>
            <div>
              <div className="text-center mb-6 md:mb-8">
                <p className="text-sm md:text-sm lg:text-sm sm:text-xs text-black font-light mb-2 font-futura-pt-light">Step 5</p>
                <h2 className="text-lg md:text-lg lg:text-lg sm:text-md text-black leading-tight font-futura-pt-book font-light">
                  Confirm
                </h2>
              </div>
            </div>
            <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
              <div className="border-2 border-gray-300 bg-white px-4 py-5 md:px-5 md:py-6 transition-all duration-200 hover:border-black">
                <div className="flex items-center gap-2 mb-4">
                  {selectedOption && (() => {
                    const IconComponent = selectedOption.icon;
                    return <IconComponent className="w-4 h-4 text-black" strokeWidth={1.5} />;
                  })()}
                  <p className="text-sm text-black font-light font-futura-pt-book">
                    Selected option
                  </p>
                </div>
                {selectedOption ? (
                  <>
                    <h3 className="text-base md:text-lg mb-2 font-light text-black leading-tight font-futura-pt-book">
                      {selectedOption.title}
                    </h3>
                    <p className="text-sm text-black font-light leading-relaxed font-futura-pt-light">
                      {selectedOption.description}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 font-light font-futura-pt-light">
                    No option selected.
                  </p>
                )}
              </div>
              <div className="border-2 border-gray-300 bg-white px-4 py-5 md:px-5 md:py-6 transition-all duration-200 hover:border-black">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-black" strokeWidth={1.5} />
                  <p className="text-sm text-black font-light font-futura-pt-book">Selected item</p>
                </div>
                {selectedItem ? (
                  <>
                    <h3 className="text-base md:text-lg mb-2 font-light text-black leading-tight font-futura-pt-book">
                      {selectedItem.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-black font-light font-futura-pt-light">
                      <span>Order: {selectedOrder?.id}</span>
                      <span>·</span>
                      <span>Size: {selectedItem.size}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 font-light font-futura-pt-light">
                    No item selected.
                  </p>
                )}
              </div>
              <div className="border-2 border-gray-300 bg-white px-4 py-5 md:px-5 md:py-6 lg:col-span-2 transition-all duration-200 hover:border-black">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={1.5} />
                  <p className="text-sm text-black font-light font-futura-pt-book">
                    Condition summary
                  </p>
                </div>
                {conditionSummary.length === 0 ? (
                  <p className="text-sm text-gray-500 font-light font-futura-pt-light">
                    Complete the condition check to view the summary.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {conditionSummary.map((entry) => (
                      <div
                        key={entry.id}
                        className="border-2 border-gray-300 bg-white px-4 py-3 text-sm transition-all duration-200 flex items-start gap-2 hover:border-black"
                      >
                        <Check className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
                        <div className="flex-1">
                          <span className="block text-black mb-1.5 font-light text-xs font-futura-pt-light">
                            {entry.prompt}
                          </span>
                          <span className="block text-black font-light font-futura-pt-book">
                            {entry.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-futura-pt-light antialiased text-black">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 md:py-8 lg:py-10">
        {/* Simple Header - No Card/Shadow */}
        <header className="mb-8 md:mb-10 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-black leading-tight font-futura-pt-book font-light">
            Renew Your YOBHA Garment
          </h1>
        </header>

        {!showCompletion && (
          <>
            <div className="mb-10 md:mb-12 pt-4">
              <div className="flex items-center gap-3 overflow-x-auto pt-2 pb-2 sm:gap-4 md:gap-6 scrollbar-hide">
                {STEPS.map((step, index) => {
                  const isActive = step.id === activeStep;
                  const isComplete = step.id < activeStep || (step.id === 5 && showCompletion);
                  // Allow clicking on any step that has been reached (up to highestStep)
                  const canNavigate = step.id <= highestStep;
                  return (
                    <React.Fragment key={step.id}>
                      <div
                        role={canNavigate ? "button" : undefined}
                        tabIndex={canNavigate ? 0 : -1}
                        onClick={() => canNavigate && handleStepClick(step.id)}
                        onKeyDown={(event) => {
                          if (canNavigate && (event.key === "Enter" || event.key === " ")) {
                            event.preventDefault();
                            handleStepClick(step.id);
                          }
                        }}
                        aria-disabled={!canNavigate}
                        className={`flex min-w-[90px] md:min-w-[110px] flex-col items-center gap-3 md:gap-4 text-center ${
                          canNavigate ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <div
                          className={`relative flex h-12 w-12 md:h-14 md:w-14 items-center justify-center border text-sm md:text-base font-light transition-all duration-500 rounded-full ${
                            isActive
                              ? "border-black bg-black text-white scale-105"
                              : isComplete
                              ? "border-black bg-white text-black border-2"
                              : "border-gray-300 bg-white text-gray-400"
                          }`}
                        >
                          {isComplete && !isActive && (
                            <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-black bg-white rounded-full" strokeWidth={2.5} />
                          )}
                          {step.id}
                        </div>
                        <span
                          className={`text-md md:text-sm sm:text-xs transition-colors font-light leading-tight font-futura-pt-light ${
                            isActive
                              ? "text-black "
                              : isComplete
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 transition-all duration-700 ${
                            isComplete ? "bg-black" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <section className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
              {renderStepContent()}

              <div className="mt-8 md:mt-10 space-y-3 md:space-y-0">
                {/* Error message - full width on all screens */}
                {activeStep === 5 && submitError && (
                  <div className="w-full border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 font-light flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    {submitError}
                  </div>
                )}
                
                {/* Buttons container */}
                <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1">
                    {activeStep > 1 && activeStep <= 5 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-full sm:w-auto border-2 border-black px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm text-black transition-all duration-300 hover:bg-black hover:text-white font-light flex items-center justify-center gap-2 group font-futura-pt-light"
                      >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                        Go Back
                      </button>
                    )}
                    {activeStep >= 1 && activeStep <= 4 && activeStep !== 2 && (
                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!isContinueEnabled}
                        className={`w-full sm:w-auto px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm transition-all duration-300 font-light flex items-center justify-center gap-2 group font-futura-pt-light ${
                          isContinueEnabled
                            ? "border-2 border-black bg-black text-white hover:bg-gray-900"
                            : "border-2 border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Continue
                        <ChevronRight className={`w-4 h-4 transition-transform ${isContinueEnabled ? "group-hover:translate-x-1" : ""}`} strokeWidth={2} />
                      </button>
                    )}
                    {activeStep === 5 && (
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canConfirm || isSubmitting}
                        className={`w-full sm:w-auto px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm transition-all duration-300 font-light flex items-center justify-center gap-2 font-futura-pt-light ${
                          canConfirm && !isSubmitting
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
                            Confirm & Continue
                            <CheckCircle className="w-4 h-4" strokeWidth={2} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto md:w-auto md:ml-auto border-2 border-gray-400 px-6 py-3 md:px-8 md:py-3.5 text-xs md:text-sm text-gray-600 transition-all duration-300 hover:border-black hover:text-black hover:bg-gray-50 font-light flex items-center justify-center gap-2 font-futura-pt-light"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={2} />
                    Reset
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {showCompletion && (
          <section className="mt-16 border border-black bg-black px-10 py-16 md:px-20 md:py-20 text-white animate-fadeIn shadow-2xl">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-white/70 mb-6 font-light text-center font-futura-pt-light">
              Completion
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8 text-center font-futura-pt-book">
              Thank you for extending the life of your YOBHA garment.
            </h2>
            {refundPercentage !== null && refundPercentage > 0 && (
              <div className="max-w-2xl mx-auto mb-8 p-6 border-2 border-white/30 bg-white/10 backdrop-blur-sm">
                <p className="text-sm md:text-base text-white/90 font-light mb-3 text-center font-futura-pt-light">
                  Refund Percentage
                </p>
                <p className="text-4xl md:text-5xl lg:text-6xl font-light mb-2 text-center font-futura-pt-book">
                  Upto {refundPercentage}%
                </p>
                <p className="text-xs md:text-sm text-white/80 font-light text-center font-futura-pt-light">
                  of product price will be given back
                </p>
              </div>
            )}
            {refundPercentage === 0 && (
              <div className="max-w-2xl mx-auto mb-8 p-6 border-2 border-white/30 bg-white/10 backdrop-blur-sm">
                <p className="text-sm md:text-base text-white/90 font-light text-center font-futura-pt-light">
                  No credit will be given for this item based on the condition assessment.
                </p>
              </div>
            )}
            <p className="max-w-2xl mx-auto text-sm md:text-base lg:text-lg leading-[1.8] text-white/80 font-light mb-12 text-center font-futura-pt-light">
              Your contribution supports circular luxury and conscious comfort.
            </p>
            <ul className="space-y-5 text-sm md:text-base text-white/90 font-light max-w-md mx-auto font-futura-pt-light">
              <li className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-white/70 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span>You'll receive an email confirmation</span>
              </li>
              {/* <li className="flex items-start gap-4">
                <Package className="w-5 h-5 text-white/70 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span>Prepaid shipping label is generated</span>
              </li>
              <li className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-white/70 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span>Inspection updates follow via email</span>
              </li> */}
            </ul>
            <div className="mt-16 text-sm md:text-base text-white/60 font-light space-y-3 text-center font-futura-pt-light">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                <p>support@yobha.world</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                <p>yobha.world</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Buyback3;

