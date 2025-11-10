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
        message.success("Gift Card Order Created Successfully 🎁");
        setEmail("");
        setAmount("");
        setLoading(false);
        return;
      }

      // 4️⃣ Razorpay options
      const options = {
            key: "rzp_test_Rb7lQAPEkEa2Aw",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-[Helvetica Neue]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Buy Gift Card
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-orange-300"
            />
          </div>

          {/* Gift Card Amount */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Gift Card Amount
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-orange-300"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block mb-1 text-sm font-medium">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block mb-1 text-sm font-medium">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="IN">India</option>
              <option value="US">USA</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition-all ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
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
