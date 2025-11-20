import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBuybackDetails } from "../../service/buyback";
import { Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Star, ArrowRight } from "lucide-react";

const BuybackAll = () => {
	const [requests, setRequests] = useState([]);
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
			return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle };
		}
		if (statusLower.includes("pending")) {
			return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: Clock };
		}
		if (statusLower.includes("reject") || statusLower.includes("cancel") || statusLower.includes("rejected")) {
			return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
		}
		return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: AlertCircle };
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
		if (amount === null || amount === undefined) return "0";
		const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
		return `${symbol}${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	};

	return (
		<div className="min-h-screen bg-gray-50 font-futura-pt-light">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl font-light text-black uppercase tracking-wider mb-2">
							My Buyback Requests
						</h1>
						<p className="text-sm text-gray-600 font-light">
							Track and manage your buyback requests
						</p>
					</div>
					<Link
						to="/buyback/create"
						className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
					>
						<Package size={16} />
						New Buyback Request
					</Link>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<div className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-gray-600 font-light">Loading buyback requests...</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className="border border-red-200 bg-red-50 text-red-700 px-6 py-4 rounded-lg">
						<div className="flex items-center gap-2">
							<AlertCircle size={20} />
							<span>{error}</span>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && (!requests || requests.length === 0) && (
					<div className="border border-gray-200 rounded-lg p-12 text-center bg-white">
						<Package size={48} className="text-gray-400 mx-auto mb-4" />
						<p className="text-gray-600 font-light mb-2">No buyback requests found.</p>
						<Link
							to="/buyback/create"
							className="inline-block mt-4 text-sm text-black hover:underline active:underline underline-offset-2 uppercase tracking-wider"
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
									className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
								>
									{/* Content Section */}
									<div className="p-4 space-y-3 flex-1">
										{/* Header with Status */}
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Request ID</p>
												<p className="text-sm font-light text-black">#{req.id?.slice(-8) || idx + 1}</p>
											</div>
											<span
												className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-light uppercase tracking-wider ${buybackStatus.bg} ${buybackStatus.text} ${buybackStatus.border}`}
											>
												<StatusIcon size={12} />
												{req.buybackStatus || "Pending"}
											</span>
										</div>

										{/* Product ID */}
										{req.productId && (
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Product ID</p>
												<p className="text-sm font-light text-black">{req.productId}</p>
											</div>
										)}

										{/* Request Type & Payment Method - Compact */}
										<div className="grid grid-cols-2 gap-2">
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
												<span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-light uppercase tracking-wider ${
													req.requestType === "TradeIn" 
														? "bg-blue-50 text-blue-700" 
														: req.requestType === "Recycle"
														? "bg-green-50 text-green-700"
														: "bg-gray-50 text-gray-700"
												}`}>
													{req.requestType || "N/A"}
												</span>
											</div>
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment</p>
												<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-light uppercase tracking-wider bg-gray-50 text-gray-700">
													<CreditCard size={10} />
													{req.paymentMethod || "N/A"}
												</span>
											</div>
										</div>

										{/* Payment Status */}
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Status</p>
											<span
												className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-light uppercase tracking-wider ${paymentStatus.bg} ${paymentStatus.text} ${paymentStatus.border}`}
											>
												<PaymentStatusIcon size={12} />
												{req.paymentStatus || "Pending"}
											</span>
										</div>

										{/* Amount & Loyalty Points - Compact */}
										<div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Amount</p>
												<p className="text-sm font-light text-black">
													{req.amount !== null && req.amount !== undefined
														? formatCurrency(req.amount, req.currency)
														: formatCurrency(0, req.currency)}
												</p>
											</div>
											<div>
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Points</p>
												<div className="flex items-center gap-1">
													<Star size={12} className="text-yellow-500" fill="currentColor" />
													<p className="text-sm font-light text-black">
														{req.loyaltyPoints !== null && req.loyaltyPoints !== undefined ? req.loyaltyPoints : 0}
													</p>
												</div>
											</div>
										</div>

										{/* Order ID - Compact */}
										{req.orderId && (
											<div className="pt-2 border-t border-gray-100">
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Order ID</p>
												<p className="text-xs font-light text-black truncate">{req.orderId}</p>
											</div>
										)}

										{/* Created Date - Compact */}
										<div className="pt-2 border-t border-gray-100">
											<p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Created</p>
											<p className="text-xs font-light text-gray-700">{formatDate(req.createdAt)}</p>
										</div>
									</div>

									{/* View Details Button */}
									<div className="p-4 pt-0 border-t border-gray-100">
										<button
											onClick={() => navigate(`/buyback/details/${req.id}`)}
											className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
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


