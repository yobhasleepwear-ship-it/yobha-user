import React, { useState } from "react";
import ImageUploader from "../../comman/Image-Uploader/ImageUploader"; // adjust path
import { createBuyback, getBuybackDetails } from "../../service/buyback";

const initialQuestions = [
  { que: "Select Your Category", ans: "", options: ["Loungewear Set", "Homewear", "Sleepwear", "Accessories"] },
  { que: "Is your YOBHA piece clean and gently used?", ans: "", options: ["Yes, it's clean and fresh", "Slightly used but well cared for", "Needs cleaning or repair"] },
  { que: "Are there any stains, tears, or damage?", ans: "", options: ["No visible marks", "Minor wear (small stains, light pilling)", "Major stains or fabric damage"] },
  { que: "Is the fabric still soft and in wearable condition?", ans: "", options: ["Yes, feels like new", "Slightly faded but good", "Rough or heavily worn"] },
  { que: "Does your piece have the original YOBHA label or tag?", ans: "", options: ["Yes, perfectly intact", "Slightly faded but visible", "Missing or removed"] },
  { que: "Are all buttons, ties, or zippers in working order?", ans: "", options: ["All perfect", "One or two need minor fixing", "Several are broken or missing"] },
  { que: "Next Step Preference", ans: "", options: ["Trade in for YOBHA Care Credit (Buy-Back)", "Send for minor repair and reuse", "Recycle responsibly with YOBHA Eco Initiative"] },
];

const Buyback = () => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [productId, setProductId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [productUrls, setProductUrls] = useState([]); // 4 images max
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [buybackData, setBuybackData] = useState([]);

  // Handle radio answer
  const handleAnswer = (index, value) => {
    const updated = [...questions];
    updated[index].ans = value;
    setQuestions(updated);
  };

  // Limit to 4 uploaded images
  const handleProductUpload = (results) => {
    const allImages = [...productUrls, ...results];
    if (allImages.length > 4) {
      setProductUrls(allImages.slice(0, 4));
      alert("You can upload only 4 product images.");
    } else {
      setProductUrls(allImages);
    }
  };

  const GetBuybackDetails = async () => {
    try {
      const response = await getBuybackDetails();
      const statusMessage = response?.data?.message
      setBuybackData(response.data.data)
      setMessage(statusMessage);
    } catch (err) {
      console.error("GetBuybackDetails error:", err);
      setMessage("Unable to fetch buyback status right now. Please try again later.");
    }
  };
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!productId) return setMessage("Product ID is required.");
    if (productUrls.length < 4) return setMessage("Please upload 4 product images.");

    // ✅ Invoice required only if no order number
    if (!orderNumber && !invoiceUrl) {
      return setMessage("Please upload your invoice or bill (required if no order number).");
    }

    if (questions.some((q) => q.ans === "")) {
      return setMessage("Please answer all questions before submitting.");
    }

    const selectedCountry = { code: "IN", label: "India" };

    const payload = {
      orderId: orderNumber || null,
      productId,
      productUrl: productUrls.map((p) => p.url),
      invoiceUrl,
      country: selectedCountry.label,
      quiz: questions.map(({ que, ans }) => ({ Ques: que, Ans: ans })),

    };

    try {
      setMessage("Submitting your buyback request...");
      const res = await createBuyback(payload);
      console.log("✅ API Response:", res);
      setMessage("✅ Buyback request submitted successfully!");
      handleReset();
    } catch (error) {
      console.error("❌ Buyback API error:", error);
      setMessage("❌ Failed to submit. Please try again later.");
    }
  };


  // Reset form
  const handleReset = () => {
    setQuestions(initialQuestions);
    setProductId("");
    setOrderNumber("");
    setProductUrls([]);
    setInvoiceUrl("");
    setMessage("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-premium-beige font-sweet-sans text-text-dark">
      <div className="pointer-events-none absolute -top-32 -left-24 hidden h-96 w-96 rounded-full bg-luxury-gold/10 blur-3xl md:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-10 hidden h-80 w-80 rounded-full bg-text-rose-gold/8 blur-3xl lg:block" />
      <div className="relative z-10 mx-auto  px-4 py-10 sm:px-6 lg:py-16">
        <div className="border border-white/40 bg-premium-beige p-6 shadow-[0_30px_80px_rgba(18,18,18,0.08)] backdrop-blur-xl sm:p-10">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.2em] text-text-dark sm:text-3xl sm:tracking-[0.3em] md:text-4xl md:tracking-[0.35em]">
            <span className="text-luxury-gold">YOBHA</span> Buy-Back Eligibility Quiz
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-medium/90 sm:text-base">
            Complete this short quiz to evaluate your item for our Buy-Back Program.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
            {/* Product Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-text-medium/70">
                  Product ID
                </label>
                <div className="border border-white/70 bg-white/70 px-3 py-2.5 text-sm text-text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:border-luxury-gold/40 hover:shadow-md focus-within:border-luxury-gold/60 focus-within:shadow-md sm:px-4 sm:py-3">
                  <input
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="e.g. YB-12345"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-text-medium/70">
                  Order Number
                </label>
                <div className="border border-white/70 bg-white/70 px-3 py-2.5 text-sm text-text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:border-luxury-gold/40 hover:shadow-md focus-within:border-luxury-gold/60 focus-within:shadow-md sm:px-4 sm:py-3">
                  <input
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="e.g. ORD-98765"
                  />
                </div>
              </div>
            </div>

            {/* Quiz Questions */}
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="border border-white/60 bg-white/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-text-dark/80 sm:mb-4 sm:text-xs sm:tracking-[0.3em]">
                  {q.que}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`group relative flex flex-col gap-2 border border-white/70 px-4 py-3 text-sm shadow-sm transition hover:border-luxury-gold/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${q.ans === opt
                          ? "border-luxury-gold/60 bg-white"
                          : "bg-white/80"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={q.ans === opt}
                        onChange={() => handleAnswer(idx, opt)}
                        className="h-4 w-4 cursor-pointer accent-luxury-gold"
                      />
                      <span
                        className={`w-full text-left text-sm font-medium transition sm:w-auto ${q.ans === opt ? "text-text-dark" : "text-text-dark/80"
                          }`}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Upload Section */}
            <div className="border border-dashed border-luxury-gold/40 bg-white/65 p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-text-dark/70">
                Upload Product & Invoice Images
              </p>

              {/* Product Images */}
              <div className="border border-white/60 bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition hover:border-luxury-gold/40 hover:shadow-md focus-within:border-luxury-gold/50">
                <ImageUploader
                  productId={productId}
                  onUploadComplete={handleProductUpload}
                />
              </div>

              {productUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {productUrls.map((img, i) => (
                    <div
                      key={i}
                      className="overflow-hidden border border-white/70 bg-white/85 shadow-sm transition hover:border-luxury-gold/40 hover:shadow-md"
                    >
                      <img
                        src={img.url}
                        alt={`Product ${i + 1}`}
                        className="h-28 w-full object-cover transition duration-500 ease-out hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Invoice Upload */}
              <div className="mt-6">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-dark/70">
                  Upload Invoice / Bill
                </h4>
                <div className="border border-white/60 bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition hover:border-luxury-gold/40 hover:shadow-md focus-within:border-luxury-gold/50">
                  <ImageUploader
                    productId={`${productId || "unknown"}_invoice`}
                    onUploadComplete={(results) => setInvoiceUrl(results[0]?.url || "")}
                  />
                </div>
                {invoiceUrl && (
                  <div className="mt-3 text-sm">
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-text-rose-gold underline transition hover:text-luxury-gold"
                    >
                      View Uploaded Invoice
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="border border-luxury-gold/40 bg-white/70 px-5 py-4 text-sm text-text-dark/80 shadow-sm">
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <button
                type="submit"
                className="w-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-neutral-900 hover:shadow-xl sm:w-auto"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-text-light/30 px-5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-text-medium transition hover:bg-white/80 hover:text-text-dark sm:w-auto"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={GetBuybackDetails}
                className="w-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-neutral-900 hover:shadow-xl sm:w-auto"
              >
                Get Buyback Status
              </button>
            </div>
          </form>
        </div>
      </div>
      {buybackData.length > 0 && (
  <div className="mt-8 space-y-6">
   {buybackData.length > 0 && (
  <div className="mt-10 space-y-8 p-8">
    {buybackData.map((item) => (
      <div
        key={item.id}
        className="border border-luxury-gold/40 bg-gradient-to-br from-white/90 to-[#fff9f3] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] rounded-2xl transition hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold uppercase tracking-[0.25em] text-text-dark">
            Product ID: <span className="text-luxury-gold">{item.productId}</span>
          </h3>
          <p className="text-sm text-text-medium">
            Order ID: <span className="font-medium text-text-dark">{item.orderId}</span>
          </p>
        </div>

        {/* Product Images */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {item.productUrl.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-white/70 shadow-sm transition hover:shadow-lg hover:border-luxury-gold/60"
            >
              <img
                src={url}
                alt={`Product ${i + 1}`}
                className="h-28 w-full object-cover transition duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-2 transition">
                <span className="text-xs text-white font-medium tracking-wide">View</span>
              </div>
            </a>
          ))}
        </div>

        {/* Status */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
          <span
            className={`px-3 py-1.5 rounded-full shadow-sm ${
              item.buybackStatus === "approved"
                ? "bg-green-100 text-green-700 border border-green-300"
                : item.buybackStatus === "rejected"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-yellow-50 text-yellow-700 border border-yellow-300"
            }`}
          >
            Buyback: {item.buybackStatus}
          </span>

          <span
            className={`px-3 py-1.5 rounded-full shadow-sm ${
              item.finalStatus === "approved"
                ? "bg-green-100 text-green-700 border border-green-300"
                : item.finalStatus === "rejected"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-yellow-50 text-yellow-700 border border-yellow-300"
            }`}
          >
            Final: {item.finalStatus}
          </span>

          <span
            className={`px-3 py-1.5 rounded-full shadow-sm ${
              item.deliveryStatus === "delivered"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-blue-50 text-blue-700 border border-blue-300"
            }`}
          >
            Delivery: {item.deliveryStatus}
          </span>
        </div>

        {/* Quiz Summary */}
        <div className="mt-6 border-t border-white/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-dark/70 mb-3">
            Your Answers
          </p>
          <ul className="space-y-2 text-sm text-text-medium/90">
            {item.quiz.map((q, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/60 border border-white/60 px-3 py-2 rounded-md hover:border-luxury-gold/40 hover:shadow-sm transition"
              >
                <span className="font-medium text-text-dark/80">{q.ques}</span>
                <span className="text-text-rose-gold font-semibold mt-1 sm:mt-0">{q.ans}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-4 text-[10px] text-text-medium/70 italic">
          Submitted on: {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>
    ))}
  </div>
)}

  </div>
)}

    </div>
  );
};

export default Buyback;
