import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import { LocalStorageKeys } from "../../constants/localStorageKeys";

const STEPS = [
  { id: 1, title: "Choose Your Option" },
  { id: 2, title: "Find Your Order" },
  { id: 3, title: "Select Your Item" },
  { id: 4, title: "Condition Check" },
  { id: 5, title: "Confirm" },
];

const TRADE_IN_OPTIONS = [
  {
    id: "credit",
    title: "Trade-in for Credit",
    description: "Return your YOBHA piece and earn Care Credit instantly.",
    tagline: "Smart value · Effortless upgrade",
  },
  {
    id: "repair",
    title: "Repair & Reuse",
    description: "We fix the piece, refresh it, and send it back to you.",
    tagline: "Restored luxury · Personal continuity",
  },
  {
    id: "recycle",
    title: "Recycle Responsibly",
    description: "Send it back to be renewed into our circular collections.",
    tagline: "Circular comfort · Zero waste",
  },
];

const DUMMY_ORDERS = [
  {
    id: "ORD-92451",
    placedOn: "2024-09-18",
    category: "Loungewear",
    collection: "Ivory Cloud",
    purchaseDateLabel: "Last 6 Months",
    items: [
      {
        id: "YB-LS-01",
        name: "Loungewear Set - Ivory Cloud",
        hue: "from-[#f5f2ed] to-[#dfd9d1]",
        size: "S",
      },
      {
        id: "YB-LT-03",
        name: "Sleepwear Top - Mist Grey",
        hue: "from-[#efefef] to-[#d7d7d7]",
        size: "M",
      },
      {
        id: "YB-AC-11",
        name: "Eye Mask - Sand Beige",
        hue: "from-[#f6f2ea] to-[#e5d9c7]",
        size: "Standard",
      },
    ],
  },
  {
    id: "ORD-88107",
    placedOn: "2024-06-02",
    category: "Sleepwear",
    collection: "Mist Grey",
    purchaseDateLabel: "Last 12 Months",
    items: [
      {
        id: "YB-SW-21",
        name: "Sleepwear Top - Mist Grey",
        hue: "from-[#f4f5f7] to-[#dfe3ea]",
        size: "L",
      },
      {
        id: "YB-SW-22",
        name: "Sleepwear Bottom - Mist Grey",
        hue: "from-[#f2f6f5] to-[#d8e3e1]",
        size: "L",
      },
    ],
  },
  {
    id: "ORD-73164",
    placedOn: "2023-11-24",
    category: "Accessories",
    collection: "Sand Beige",
    purchaseDateLabel: "2023 Purchases",
    items: [
      {
        id: "YB-EM-07",
        name: "Eye Mask - Sand Beige",
        hue: "from-[#f4ece2] to-[#e4d1bb]",
        size: "One Size",
      },
      {
        id: "YB-HB-15",
        name: "Headband - Classic Black",
        hue: "from-[#f0f0f0] to-[#d4d4d4]",
        size: "One Size",
      },
    ],
  },
];

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
    prompt: "Does it still have the YOBHA tag/label?",
    options: ["Yes", "Faded", "Missing"],
  },
  {
    id: "fastening",
    prompt: "Are all zippers/buttons fine?",
    options: ["Yes", "Few issues", "Broken"],
  },
];

const COMPLETION_FOOTERS = [
  "You'll receive an email confirmation.",
  "A prepaid shipping label is generated instantly.",
  "Inspection updates follow via email at each milestone.",
];

const Buyback2 = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [conditionResponses, setConditionResponses] = useState({});
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(LocalStorageKeys.AuthToken);
    if (token && token !== "undefined" && token !== "null") {
      setIsAuthenticated(true);
    }

    const handleStorage = (event) => {
      if (event.key === LocalStorageKeys.AuthToken) {
        const nextToken = event.newValue;
        setIsAuthenticated(Boolean(nextToken && nextToken !== "undefined" && nextToken !== "null"));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredOrders = useMemo(() => {
    return DUMMY_ORDERS.filter((order) => {
      const matchCategory = selectedCategory === "All" || order.category === selectedCategory;
      const matchCollection = selectedCollection === "All" || order.collection === selectedCollection;
      const matchDate = selectedPurchaseDate === "All" || order.purchaseDateLabel === selectedPurchaseDate;
      return matchCategory && matchCollection && matchDate;
    });
  }, [selectedCategory, selectedCollection, selectedPurchaseDate]);

  const categories = useMemo(
    () => ["All", ...new Set(DUMMY_ORDERS.map((order) => order.category))],
    []
  );

  const collections = useMemo(
    () => ["All", ...new Set(DUMMY_ORDERS.map((order) => order.collection))],
    []
  );

  const purchaseDates = useMemo(
    () => ["All", ...new Set(DUMMY_ORDERS.map((order) => order.purchaseDateLabel))],
    []
  );

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
      CONDITION_QUESTIONS.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        value: conditionResponses[question.id],
      })).filter((entry) => Boolean(entry.value)),
    [conditionResponses]
  );

  const handleOptionSelect = (optionId) => {
    setSelectedOptionId(optionId);
    setShowCompletion(false);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setSelectedItem(null);
    setShowCompletion(false);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setShowCompletion(false);
  };

  const handleConditionChange = (questionId, answer) => {
    setConditionResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleReset = () => {
    setActiveStep(1);
    setHighestStep(1);
    setSelectedOptionId(null);
    setSelectedCategory("All");
    setSelectedCollection("All");
    setSelectedPurchaseDate("All");
    setSelectedOrder(null);
    setSelectedItem(null);
    setConditionResponses({});
    setShowCompletion(false);
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setShowCompletion(false);
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (!isContinueEnabled) {
      return;
    }
    const nextStep = activeStep + 1;
    setShowCompletion(false);
    setActiveStep(nextStep);
    setHighestStep((prev) => Math.max(prev, nextStep));
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    setShowCompletion(true);
    setHighestStep((prev) => Math.max(prev, 5));
  };

  const canConfirm =
    Boolean(selectedOption) &&
    Boolean(selectedItem) &&
    conditionSummary.length === CONDITION_QUESTIONS.length;

  const isContinueEnabled = useMemo(() => {
    switch (activeStep) {
      case 1:
        return Boolean(selectedOptionId);
      case 2:
        return Boolean(isAuthenticated && selectedOrder);
      case 3:
        return Boolean(selectedItem);
      case 4:
        return allConditionsAnswered;
      default:
        return false;
    }
  }, [activeStep, selectedOptionId, isAuthenticated, selectedOrder, selectedItem, allConditionsAnswered]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-light">Step 1</p>
              <h2 className="mt-2 text-2xl font-medium uppercase tracking-[0.14em] text-black">
                Choose your option
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-medium">
                Select the pathway that feels right for your YOBHA piece. When you are ready, use the
                continue control to move ahead.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TRADE_IN_OPTIONS.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`border border-black/15 bg-white px-6 py-8 text-left transition-all duration-300 hover:border-black rounded-none ${
                      isSelected ? "border-black bg-black text-white" : ""
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-text-light">
                      {option.tagline}
                    </p>
                    <h3 className="mt-4 text-xl font-medium uppercase tracking-[0.14em]">
                      {option.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-text-medium">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-light">Step 2</p>
              <h2 className="mt-2 text-2xl font-medium uppercase tracking-[0.14em] text-black">
                Find your order
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-medium">
                Orders load from your account automatically. Filter by category, collection, or date to
                pinpoint the exact purchase.
              </p>
            </div>
            {!isAuthenticated ? (
              <div className="border border-black/15 bg-white px-5 py-6 rounded-none sm:px-6 sm:py-8">
                <p className="text-base font-medium uppercase tracking-[0.18em] text-black">
                  Sign in to surface your orders
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-medium">
                  Your current progress remains saved. Once authenticated, your order history appears
                  instantly—no manual entry required.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-3 border border-black px-5 py-3 text-xs uppercase tracking-[0.28em] text-black transition hover:bg-black hover:text-white rounded-none sm:px-6"
                >
                  Go to login
                  <HiOutlineArrowSmRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 border border-black/15 bg-white px-5 py-5 sm:px-6 sm:py-6 sm:grid-cols-3 rounded-none">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-text-light">
                      Filter by category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className="border border-black/20 bg-transparent px-3 py-3 text-xs uppercase tracking-[0.25em] text-black focus:border-black focus:outline-none rounded-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-text-light">
                      Filter by collection
                    </label>
                    <select
                      value={selectedCollection}
                      onChange={(event) => setSelectedCollection(event.target.value)}
                      className="border border-black/20 bg-transparent px-3 py-3 text-xs uppercase tracking-[0.25em] text-black focus:border-black focus:outline-none rounded-none"
                    >
                      {collections.map((collection) => (
                        <option key={collection} value={collection}>
                          {collection}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.3em] text-text-light">
                      Purchase date
                    </label>
                    <select
                      value={selectedPurchaseDate}
                      onChange={(event) => setSelectedPurchaseDate(event.target.value)}
                      className="border border-black/20 bg-transparent px-3 py-3 text-xs uppercase tracking-[0.25em] text-black focus:border-black focus:outline-none rounded-none"
                    >
                      {purchaseDates.map((dateOption) => (
                        <option key={dateOption} value={dateOption}>
                          {dateOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                  {filteredOrders.length === 0 ? (
                    <div className="border border-black/15 bg-white px-6 py-10 text-center text-sm uppercase tracking-[0.22em] text-text-light rounded-none sm:px-8 sm:py-12">
                      No orders match the current filters.
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => handleOrderSelect(order)}
                          className={`border border-black/15 bg-white px-5 py-6 text-left transition hover:border-black rounded-none sm:px-6 ${
                            isSelected ? "border-black bg-black text-white" : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.3em]">
                            <span>My past orders</span>
                            <span>{order.purchaseDateLabel}</span>
                          </div>
                          <h3 className="mt-4 text-lg uppercase tracking-[0.18em]">{order.id}</h3>
                          <p className="mt-2 text-sm text-text-medium">
                            Placed on{" "}
                            {new Intl.DateTimeFormat("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(order.placedOn))}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em]">
                            <span className={isSelected ? "text-white" : "text-black"}>
                              {order.category}
                            </span>
                            <span className={isSelected ? "text-white" : "text-black"}>
                              {order.collection}
                            </span>
                            <span className={isSelected ? "text-white" : "text-black"}>
                              {order.items.length} items
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-light">Step 3</p>
              <h2 className="mt-2 text-2xl font-medium uppercase tracking-[0.14em] text-black">
                Select your item
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-medium">
                Every item from the chosen order appears below. Choose the precise piece you plan to
                send for trade-in.
              </p>
            </div>
            {!selectedOrder ? (
              <div className="border border-black/15 bg-white px-6 py-10 text-center text-sm uppercase tracking-[0.22em] text-text-light rounded-none sm:px-8 sm:py-12">
                Select an order in Step 2 to view its items.
              </div>
            ) : (
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                {selectedOrder.items.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemSelect(item)}
                    className={`border border-black/15 bg-white px-5 py-6 text-left transition hover:border-black rounded-none sm:px-6 ${
                        isSelected ? "border-black bg-black text-white" : ""
                      }`}
                    >
                      <div className={`h-40 w-full bg-gradient-to-br sm:h-44 ${item.hue}`} />
                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg uppercase tracking-[0.16em]">{item.name}</h3>
                        <p className="text-sm text-text-medium">Catalogue ID: {item.id}</p>
                        <p className="text-sm text-text-medium">Size: {item.size}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-light">Step 4</p>
              <h2 className="mt-2 text-2xl font-medium uppercase tracking-[0.14em] text-black">
                Condition check
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-medium">
                Answer four focused questions so that our atelier can prepare the right evaluation
                journey for your piece.
              </p>
            </div>
            {!selectedItem ? (
              <div className="border border-black/15 bg-white px-6 py-10 text-center text-sm uppercase tracking-[0.22em] text-text-light rounded-none sm:px-8 sm:py-12">
                Select an item in Step 3 to begin the condition check.
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {CONDITION_QUESTIONS.map((question) => (
                    <div key={question.id} className="border border-black/15 bg-white px-5 py-5 rounded-none sm:px-6">
                      <p className="text-xs uppercase tracking-[0.28em] text-black">
                        {question.prompt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {question.options.map((option) => {
                          const isSelected = conditionResponses[question.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleConditionChange(question.id, option)}
                              className={`border border-black/20 px-5 py-2 text-xs uppercase tracking-[0.28em] transition hover:border-black rounded-none ${
                                isSelected ? "border-black bg-black text-white" : "bg-white"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setConditionResponses({})}
                    className="border border-black/20 px-5 py-2 text-xs uppercase tracking-[0.28em] text-black transition hover:border-black rounded-none"
                  >
                    Clear answers
                  </button>
                </div>
              </>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-light">Step 5</p>
              <h2 className="mt-2 text-2xl font-medium uppercase tracking-[0.14em] text-black">
                Confirm
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-medium">
                Review the details below before you proceed. You can move backwards if anything needs a
                quick refinement.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-black/15 bg-white px-5 py-6 rounded-none sm:px-6">
                <p className="text-xs uppercase tracking-[0.28em] text-text-light">
                  Selected option
                </p>
                {selectedOption ? (
                  <>
                    <h3 className="mt-4 text-lg uppercase tracking-[0.16em]">
                      {selectedOption.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-medium">
                      {selectedOption.description}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm uppercase tracking-[0.22em] text-text-light">
                    No option selected.
                  </p>
                )}
              </div>
              <div className="border border-black/15 bg-white px-5 py-6 rounded-none sm:px-6">
                <p className="text-xs uppercase tracking-[0.28em] text-text-light">Selected item</p>
                {selectedItem ? (
                  <>
                    <h3 className="mt-4 text-lg uppercase tracking-[0.16em]">
                      {selectedItem.name}
                    </h3>
                    <p className="mt-2 text-sm text-text-medium">
                      Order: {selectedOrder?.id} · Size: {selectedItem.size}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm uppercase tracking-[0.22em] text-text-light">
                    No item selected.
                  </p>
                )}
              </div>
              <div className="border border-black/15 bg-white px-5 py-6 rounded-none sm:px-6 lg:col-span-2">
                <p className="text-xs uppercase tracking-[0.28em] text-text-light">
                  Condition summary
                </p>
                {conditionSummary.length === 0 ? (
                  <p className="mt-4 text-sm uppercase tracking-[0.22em] text-text-light">
                    Complete the condition check to view the summary.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {conditionSummary.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-black/15 bg-white px-4 py-3 text-sm uppercase tracking-[0.18em] rounded-none"
                      >
                        <span className="block text-text-light">{entry.prompt}</span>
                        <span className="mt-1 block text-black">{entry.value}</span>
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

  const showBackButton = activeStep > 1 && activeStep <= 4;
  const showContinueButton = activeStep >= 1 && activeStep <= 4;

  return (
    <div className="min-h-screen bg-premium-cream font-sweet-sans text-text-dark">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="border border-black/10 bg-white/70 px-10 py-12 rounded-none">
          <p className="text-xs uppercase tracking-[0.28em] text-text-light">
            YOBHA Renew · Trade-In Flow
          </p>
          <h1 className="mt-4 text-4xl font-medium uppercase tracking-[0.16em] text-black">
            Give your YOBHA piece a new life
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-medium">
            A streamlined journey inspired by modern luxury retail. Move step by step with clarity,
            confidence, and the calm precision of YOBHA.
          </p>
        </header>

        <div className="mt-12">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:gap-6">
            {STEPS.map((step, index) => {
              const isActive = step.id === activeStep;
              const isUnlocked = step.id <= highestStep;
              const isComplete = step.id < activeStep || (step.id === 5 && showCompletion);
              const circleClasses = isActive
                ? "bg-black text-white border-black"
                : isUnlocked
                ? "bg-white text-black border-black/80"
                : "bg-white text-text-light border-black/20";
              const labelClasses = isActive
                ? "text-black"
                : isUnlocked
                ? "text-text-medium"
                : "text-text-light";
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => isUnlocked && setActiveStep(step.id)}
                    disabled={!isUnlocked}
                    className="flex min-w-[72px] flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center border text-xs font-medium tracking-[0.2em] uppercase transition ${circleClasses} ${
                        isUnlocked ? "cursor-pointer" : "cursor-not-allowed"
                      } rounded-full`}
                    >
                      {step.id}
                    </span>
                    <span
                      className={`text-[11px] uppercase tracking-[0.24em] transition whitespace-nowrap ${labelClasses}`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <>
                      <div
                        className={`h-px w-12 flex-shrink-0 bg-black/15 sm:hidden ${
                          isComplete ? "!bg-black" : ""
                        }`}
                      />
                      <div
                        className={`hidden h-px flex-1 bg-black/15 sm:block ${
                          isComplete ? "!bg-black" : ""
                        }`}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <section className="mt-12 border border-black/10 bg-white/80 px-5 py-10 rounded-none sm:px-10 sm:py-12">
          {renderStepContent()}

          <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="border border-black px-5 py-3 text-xs uppercase tracking-[0.26em] text-black transition hover:bg-black hover:text-white rounded-none sm:px-6"
              >
                Back
              </button>
            )}
            {showContinueButton && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isContinueEnabled}
                className={`px-5 py-3 text-xs uppercase tracking-[0.26em] transition rounded-none sm:px-6 ${
                  isContinueEnabled
                    ? "border border-black bg-black text-white hover:bg-black/90"
                    : "border border-black/20 bg-black/10 text-black/40 cursor-not-allowed"
                }`}
              >
                Continue &gt;
              </button>
            )}
            {activeStep === 5 && (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="border border-black px-6 py-3 text-xs uppercase tracking-[0.26em] text-black transition hover:bg-black hover:text-white rounded-none"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className={`px-5 py-3 text-xs uppercase tracking-[0.26em] transition rounded-none sm:px-6 ${
                    canConfirm
                      ? "border border-black bg-black text-white hover:bg-black/90"
                      : "border border-black/20 bg-black/10 text-black/40 cursor-not-allowed"
                  }`}
                >
                  Confirm &amp; Finish
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.26em] text-text-medium transition hover:border-black hover:text-black rounded-none sm:px-6"
            >
              Reset Flow
            </button>
          </div>
        </section>

        {showCompletion && (
          <section className="mt-12 border border-black bg-black px-10 py-12 text-white rounded-none">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Completion</p>
            <h2 className="mt-4 text-3xl font-medium uppercase tracking-[0.18em]">
              Thank you for extending the life of your YOBHA piece.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Your contribution supports circular luxury and conscious comfort. Look out for an email
              confirmation, a prepaid shipping label, and inspection updates as your piece moves
              through evaluation.
            </p>
            <ul className="mt-8 space-y-4 text-sm uppercase tracking-[0.2em] text-white/80">
              {COMPLETION_FOOTERS.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <div className="mt-10 text-sm uppercase tracking-[0.22em] text-white/70">
              <p>support@yobha.world</p>
              <p>yobha.in</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Buyback2;

