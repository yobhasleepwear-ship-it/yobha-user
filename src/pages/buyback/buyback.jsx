import React, { useEffect, useState } from "react";
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
  const [buybackData, setBuybackData] = useState()

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
      const response = getBuybackDetails()
      setBuybackData(response.data)
    }
    catch (err) {
      message.error(err)
    }
  }
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
      quiz: questions.map(({ que, ans }) => ({ que, ans })),
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
    <div className="min-h-screen bg-premium-cream font-sans">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-widest mb-2">
            YOBHA Buy-Back Eligibility Quiz
          </h1>
          <p className="text-text-medium mb-6">
            Complete this short quiz to evaluate your item for our Buy-Back Program.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product ID</label>
                <input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-text-light/20 p-2 outline-none"
                  placeholder="e.g. YB-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Number</label>
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-text-light/20 p-2 outline-none"
                  placeholder="e.g. ORD-98765"
                />
              </div>
            </div>

            {/* Quiz Questions */}
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-text-light/20">
                <p className="font-semibold mb-3 text-black uppercase tracking-wide">{q.que}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={q.ans === opt}
                        onChange={() => handleAnswer(idx, opt)}
                        className="form-radio h-4 w-4"
                      />
                      <span className="text-sm text-text-dark">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Upload Section */}
            <div className="p-4 rounded-lg border border-text-light/20">
              <p className="font-semibold mb-4 text-black uppercase tracking-wide">
                Upload Product & Invoice Images
              </p>

              {/* Product Images */}
              <ImageUploader
                productId={productId}
                onUploadComplete={handleProductUpload}
              />

              {productUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {productUrls.map((img, i) => (
                    <div key={i} className="border rounded-md overflow-hidden">
                      <img
                        src={img.url}
                        alt={`Product ${i + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Invoice Upload */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-black uppercase tracking-wider mb-2">
                  Upload Invoice / Bill
                </h4>
                <ImageUploader
                  productId={`${productId || "unknown"}_invoice`}
                  onUploadComplete={(results) => setInvoiceUrl(results[0]?.url || "")}
                />
                {invoiceUrl && (
                  <div className="mt-2 text-sm text-blue-600 underline">
                    <a href={invoiceUrl} target="_blank" rel="noreferrer">
                      View Uploaded Invoice
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {message && <div className="text-sm text-gray-700">{message}</div>}

            {/* Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-luxury-gold text-white font-medium shadow-sm hover:opacity-95"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-md border border-text-light/20"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={GetBuybackDetails}
                className="px-5 py-2 rounded-md bg-[#ea5430] text-white font-medium shadow-sm hover:opacity-95"
              >
                Get Buyback Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Buyback;
