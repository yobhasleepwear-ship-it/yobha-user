import React, { useState } from "react";
import { message } from "../../comman/toster-message/ToastContainer";
import { createOrder, updatePayment } from "../../service/orderService";

// import { createOrder, updatePayment } from "../../service/orderAPI"; // adjust path if needed

const GiftCardPage = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("IN");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !amount) {
      message.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Construct Gift Card payload
      const giftCardPurchase = {
         "currency": currency,
        "productRequests": [],
        "shippingAddress": null,
        "paymentMethod": "razorpay",
        "giftCardAmount":  parseFloat(amount),
        "email": email,
        "orderCountry": country 
      };

      // 2️⃣ Create Order
      const orderRes = await createOrder(giftCardPurchase);

      if (!orderRes.success) {
        message.error("Order creation failed ❌");
        setLoading(false);
        return;
      }

      // 3️⃣ If no Razorpay order, mark as success
      if (!orderRes.razorpayOrderId) {
        message.success("Gift Card Order Created Successfully 🎁", 10000);
        setEmail("");
        setAmount("");
        setLoading(false);
        return;
      }

      // 4️⃣ Razorpay options
      const options = {
            key: "rzp_live_S50ndRcWPk7eP5",
            amount:parseFloat(amount) * 100,
            currency: currency,
            order_id: orderRes.razorpayOrderId,
            prefill: { email: email},
            handler: async (response) => {
              const updateRes = await updatePayment({
                razorpayOrderId: orderRes.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                isSuccess: true,
              });
    
              message.success("Payment successful ✅");
           
            },
          };
    
          const rzp = new window.Razorpay(options);
          rzp.open();
    } catch (error) {
      console.error("GiftCard order error:", error);
      message.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-futura-pt-light">
      <div className="bg-white p-8 border border-gray-200 w-full max-w-md">
        <h2 className="text-base md:text-lg font-light mb-6 text-center text-black font-futura-pt-book">
          Buy Gift Card
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm text-black font-light font-futura-pt-book">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
            />
          </div>

          {/* Gift Card Amount */}
          <div>
            <label className="block mb-2 text-sm text-black font-light font-futura-pt-book">
              Gift Card Amount
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block mb-2 text-sm text-black font-light font-futura-pt-book">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block mb-2 text-sm text-black font-light font-futura-pt-book">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:border-black transition-colors font-light font-futura-pt-light text-sm md:text-base"
            >
              <option value="IN">India</option>
              <option value="US">USA</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 text-sm font-light transition-all duration-200 flex items-center justify-center gap-2 font-futura-pt-light ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            {loading ? "Processing..." : "Purchase Gift Card"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GiftCardPage;
