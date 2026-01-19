import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBuybackPayment, getBuybackDetails } from "../../service/buyback";
import { Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Star, ArrowRight } from "lucide-react";
import { message } from "../../comman/toster-message/ToastContainer";

const BuybackAll = () => {
	const [requests, setRequests] = useState([]);
	console.log(requests, "requests")
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		let isMounted = true;
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await getBuybackDetails();
				// service returns raw response, not response.data
				const data = res?.data ?? res;
				if (isMounted) {
					const items = Array.isArray(data) ? data : data?.data ?? [];
					setRequests(items);
				}
			} catch (err) {
				if (isMounted) {
					setError("Failed to load buyback requests.");
					setRequests([]);
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};
		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	const getStatusBadge = (status) => {
		const statusLower = String(status || "").toLowerCase();
		if (statusLower.includes("approve") || statusLower.includes("complete") || statusLower.includes("approved")) {
			return { bg: "bg-black", text: "text-white", border: "border-black", icon: CheckCircle };
		}
		if (statusLower.includes("pending")) {
			return { bg: "bg-gray-100", text: "text-black", border: "border-gray-300", icon: Clock };
		}
		if (statusLower.includes("reject") || statusLower.includes("cancel") || statusLower.includes("rejected")) {
			return { bg: "bg-white", text: "text-black", border: "border-black", icon: XCircle };
		}
		return { bg: "bg-gray-50", text: "text-black", border: "border-gray-300", icon: AlertCircle };
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateString;
		}
	};

	const formatCurrency = (amount, currency = "INR") => {
		if (amount === null || amount === undefined || amount === "") return "0";

		// If backend already sends a formatted string with a symbol, just return it
		if (typeof amount === "string" && /[^\d.,\s]/.test(amount)) {
			return amount;
		}

		const numericAmount = Number(amount);
		if (Number.isNaN(numericAmount)) {
			return String(amount);
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
	// 	const handlePayBuyback = async (buybackId) => {
	//   try {
	//     const result = await createBuybackPayment(buybackId);
	//     console.log("Payment successful:", result);
	//     // You can also update state or show a success message
	//   } catch (error) {
	//     console.error("Payment failed:", error);
	//     alert("Payment failed. Please try again.");
	//   }
	// };

	const handlePayBuyback = async (buybackId) => {
		try {
			// 1️⃣ Create / get Razorpay order
			const buybackRes = await createBuybackPayment(buybackId);
			console.log(buybackRes, "buybackRes")
			if (!buybackRes.success) {
				message.error("Payment initiation failed ❌");
				return;
			}

			if (!buybackRes.data.razorpayOrderId) {
				message.error("Razorpay order not found ❌");
				return;
			}

			// 2️⃣ Razorpay options (same pattern as order)
			const options = {
				key: "rzp_live_S50ndRcWPk7eP5",
				amount: buybackRes.data.amount * 100, // amount in paise
				currency: "INR",
				order_id: buybackRes.data.razorpayOrderId,

				handler: (response) => {
					console.log("Buyback payment success:", response);

					message.success("Buyback payment successful ✅");

					// 👉 No API call after success (as requested)
					// 👉 You can just update UI state here if needed
				},

				theme: {
					color: "#0d6efd",
				},
			};

			// 3️⃣ Open Razorpay
			const rzp = new window.Razorpay(options);
			rzp.open();

			rzp.on("payment.failed", (response) => {
				console.error("Buyback payment failed:", response.error);
				message.error(response.error.description || "Payment failed ❌");
			});

		} catch (error) {
			console.error("handlePayBuyback error:", error);
			message.error("Something went wrong ❌");
		}
	};

	return (
		<div className="min-h-screen bg-white font-futura-pt-light text-black">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl font-light text-black mb-2 font-futura-pt-book">
							My Buyback Requests
						</h1>
						<p className="text-sm text-black font-light font-futura-pt-light">
							Track and manage your buyback requests
						</p>
					</div>
					<Link
						to="/buyback/create"
						className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm hover:bg-black transition-colors font-light font-futura-pt-light"
					>
						<Package size={16} />
						New Buyback Request
					</Link>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex items-center justify-center py-20 font-futura-pt-light">
						<div className="text-center">
							<div className="w-12 h-12 border-2 border-black border-t-black rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-black font-light font-futura-pt-light">Loading buyback requests...</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className="border border-black bg-white text-black px-6 py-4 rounded-lg font-futura-pt-light">
						<div className="flex items-center gap-2 font-light">
							<AlertCircle size={20} />
							<span>{error}</span>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && (!requests || requests.length === 0) && (
					<div className="border border-black rounded-lg p-12 text-center bg-white font-futura-pt-light">
						<Package size={48} className="text-black mx-auto mb-4" />
						<p className="text-black font-light mb-2 font-futura-pt-light">No buyback requests found.</p>
						<Link
							to="/buyback/create"
							className="inline-block mt-4 text-sm text-black hover:underline active:underline underline-offset-2 font-light font-futura-pt-light"
						>
							Start a new buyback request
						</Link>
					</div>
				)}

				{/* Requests Grid */}
				{!isLoading && !error && requests && requests.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{requests.map((req, idx) => {
							const buybackStatus = getStatusBadge(req.buybackStatus);
							const paymentStatus = getStatusBadge(req.paymentStatus);
							const StatusIcon = buybackStatus.icon;
							const PaymentStatusIcon = paymentStatus.icon;

							return (
								<div
									key={req?.id ?? idx}
									className="bg-white border border-black rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col font-futura-pt-light"
								>
									{/* Content Section */}
									<div className="p-4 space-y-3 flex-1">
										{/* Header with Status */}
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Request ID</p>
												<p className="text-base font-light text-black font-futura-pt-light">
													#{req.id?.slice(-8) || idx + 1}
												</p>
											</div>
											<span
												className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-light font-futura-pt-light ${buybackStatus.bg} ${buybackStatus.text} ${buybackStatus.border}`}
											>
												<StatusIcon size={12} />
												{req.buybackStatus || "Pending"}
											</span>
										</div>

										{/* Product ID */}
										{req.productId && (
											<div>
												<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Product ID</p>
												<p className="text-base font-light text-black font-futura-pt-light">{req.productId}</p>
											</div>
										)}

										{/* Request Type & Payment Method - Compact */}
										<div className="grid grid-cols-2 gap-2">
											<div>
												<p className="text-base text-black mb-1 font-light font-futura-pt-book">Type</p>
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-light bg-white border border-black text-black font-futura-pt-light">
													{req.requestType || "N/A"}
												</span>
											</div>
											<div>
												<p className="text-base text-black mb-1 font-light font-futura-pt-book">Payment</p>
												<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-light bg-white border border-black text-black font-futura-pt-light">
													<CreditCard size={10} />
													{req.paymentMethod || "N/A"}
												</span>
											</div>
										</div>

										{/* Payment Status */}
										<div>
											<p className="text-base text-black mb-1 font-light font-futura-pt-book">Payment Status</p>
											<span
												className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-light font-futura-pt-light ${paymentStatus.bg} ${paymentStatus.text} ${paymentStatus.border}`}
											>
												<PaymentStatusIcon size={12} />
												{req.paymentStatus || "Pending"}
											</span>
										</div>

										{/* Amount & Loyalty Points - Compact */}
										<div className="grid grid-cols-2 gap-2 pt-2">
											<div>
												<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Amount</p>
												<p className="text-base font-light text-black font-futura-pt-light">
													<button
														type="button"
														onClick={() => handlePayBuyback(req.id)}
														className="font-sans cursor-pointer underline"
													>
														{formatCurrency(req.amount, req.currency)}
													</button>

												</p>
											</div>
											<div>
												<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Points</p>
												<div className="flex items-center gap-1">
													<Star size={12} className="text-black" fill="currentColor" />
													<p className="text-base font-light text-black font-futura-pt-light">
														{req.loyaltyPoints !== null && req.loyaltyPoints !== undefined ? req.loyaltyPoints : 0}
													</p>
												</div>
											</div>
										</div>

										{/* Order ID - Compact */}
										{req.orderId && (
											<div className="pt-2">
												<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Order ID</p>
												<p className="text-sm font-light text-black truncate font-futura-pt-light">{req.orderId}</p>
											</div>
										)}

										{/* Created Date - Compact */}
										<div className="pt-2">
											<p className="text-base text-black mb-0.5 font-light font-futura-pt-book">Created</p>
											<p className="text-sm font-light text-black font-futura-pt-light">{formatDate(req.createdAt)}</p>
										</div>
									</div>

									{/* View Details Button */}
									<div className="p-4 pt-0">
										<button
											onClick={() => navigate(`/buyback/details/${req.id}`)}
											className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 text-sm hover:bg-black transition-colors font-light font-futura-pt-light"
										>
											View Details
											<ArrowRight size={14} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default BuybackAll;


