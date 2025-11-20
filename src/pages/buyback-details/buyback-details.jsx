import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBuybackDetails } from "../../service/buyback";
import { ArrowLeft, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";

const BuybackDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [buyback, setBuyback] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	useEffect(() => {
		const fetchBuybackDetails = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await getBuybackDetails();
				const data = res?.data ?? res;
				const items = Array.isArray(data) ? data : data?.data ?? [];
				const foundBuyback = items.find((item) => item.id === id);
				
				if (foundBuyback) {
					setBuyback(foundBuyback);
				} else {
					setError("Buyback request not found");
				}
			} catch (err) {
				setError("Failed to load buyback details.");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchBuybackDetails();
		}
	}, [id]);

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
				month: "long",
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

	const productImages = buyback?.productUrl || [];
	const hasMultipleImages = productImages.length > 1;

	const handlePrevImage = () => {
		if (productImages.length === 0) return;
		setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
	};

	const handleNextImage = () => {
		if (productImages.length === 0) return;
		setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50 font-futura-pt-light">
				<div className="text-center">
					<div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 text-xs md:text-sm font-light">Loading buyback details...</p>
				</div>
			</div>
		);
	}

	if (error || !buyback) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-futura-pt-light px-4">
				<Package size={48} className="text-gray-400 mb-4" strokeWidth={1.5} />
				<h2 className="text-xl md:text-2xl font-light text-black uppercase mb-4">
					{error || "Buyback Not Found"}
				</h2>
				<p className="text-gray-600 text-sm font-light mb-6 text-center max-w-md">
					{error || "The buyback request you are looking for does not exist."}
				</p>
				<button
					onClick={() => navigate("/buyback/all")}
					className="bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
				>
					Back to Buyback Requests
				</button>
			</div>
		);
	}

	const buybackStatus = getStatusBadge(buyback.buybackStatus);
	const paymentStatus = getStatusBadge(buyback.paymentStatus);
	const StatusIcon = buybackStatus.icon;
	const PaymentStatusIcon = paymentStatus.icon;

	return (
		<div className="min-h-screen bg-gray-50 font-futura-pt-light">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Back Button */}
				<button
					onClick={() => navigate("/buyback/all")}
					className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
				>
					<ArrowLeft size={20} strokeWidth={1.5} />
					<span className="text-sm uppercase tracking-wider font-light">Back to Buyback Requests</span>
				</button>

				{/* Header */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-light text-black uppercase tracking-wider mb-2">
								Buyback Request Details
							</h1>
							<p className="text-sm text-gray-600 font-light">Request ID: #{buyback.id?.slice(-8)}</p>
						</div>
						<span
							className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-light uppercase tracking-wider ${buybackStatus.bg} ${buybackStatus.text} ${buybackStatus.border}`}
						>
							<StatusIcon size={18} />
							{buyback.buybackStatus || "Pending"}
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Images */}
					<div className="lg:col-span-2">
						{productImages.length > 0 ? (
							<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
								<div className="relative h-96 bg-gray-100">
									<img
										src={productImages[selectedImageIndex]}
										alt={`Product ${buyback.productId || ""}`}
										className="w-full h-full object-contain"
										onError={(e) => {
											e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
										}}
									/>
									{hasMultipleImages && (
										<>
											<button
												onClick={handlePrevImage}
												className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-gray-300 rounded-full p-2 transition-all"
												aria-label="Previous image"
											>
												<ChevronLeft size={20} className="text-black" />
											</button>
											<button
												onClick={handleNextImage}
												className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-gray-300 rounded-full p-2 transition-all"
												aria-label="Next image"
											>
												<ChevronRight size={20} className="text-black" />
											</button>
											<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
												{productImages.map((_, index) => (
													<button
														key={index}
														onClick={() => setSelectedImageIndex(index)}
														className={`w-2 h-2 rounded-full transition-all ${
															index === selectedImageIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
														}`}
														aria-label={`Go to image ${index + 1}`}
													/>
												))}
											</div>
										</>
									)}
								</div>
								{/* Thumbnail Gallery */}
								{hasMultipleImages && (
									<div className="p-4 border-t border-gray-200 grid grid-cols-4 gap-2">
										{productImages.map((img, index) => (
											<button
												key={index}
												onClick={() => setSelectedImageIndex(index)}
												className={`relative h-20 border-2 rounded overflow-hidden transition-all ${
													index === selectedImageIndex ? "border-black" : "border-gray-200 hover:border-gray-400"
												}`}
											>
												<img
													src={img}
													alt={`Thumbnail ${index + 1}`}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjwvc3ZnPg==";
													}}
												/>
											</button>
										))}
									</div>
								)}
							</div>
						) : (
							<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
								<Package size={48} className="text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 font-light">No product images available</p>
							</div>
						)}

						{/* Invoice Image */}
						{buyback.invoiceUrl && (
							<div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
								<h3 className="text-sm font-light text-black uppercase tracking-wider mb-4">Invoice</h3>
								<img
									src={buyback.invoiceUrl}
									alt="Invoice"
									className="w-full h-auto rounded border border-gray-200"
									onError={(e) => {
										e.target.style.display = "none";
									}}
								/>
							</div>
						)}
					</div>

					{/* Right Column - Details */}
					<div className="space-y-6">
						{/* Request Information */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-sm font-light text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
								Request Information
							</h3>
							<div className="space-y-4">
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Product ID</p>
									<p className="text-sm font-light text-black">{buyback.productId || "N/A"}</p>
								</div>
								{buyback.orderId && (
									<div>
										<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
										<p className="text-sm font-light text-black">{buyback.orderId}</p>
									</div>
								)}
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Request Type</p>
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-light uppercase tracking-wider ${
											buyback.requestType === "TradeIn"
												? "bg-blue-50 text-blue-700 border border-blue-200"
												: buyback.requestType === "Recycle"
												? "bg-green-50 text-green-700 border border-green-200"
												: "bg-gray-50 text-gray-700 border border-gray-200"
										}`}
									>
										{buyback.requestType || "N/A"}
									</span>
								</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
									<p className="text-sm font-light text-gray-700">{formatDate(buyback.createdAt)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Updated</p>
									<p className="text-sm font-light text-gray-700">{formatDate(buyback.updatedAt)}</p>
								</div>
							</div>
						</div>

						{/* Payment Information */}
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-sm font-light text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
								Payment Information
							</h3>
							<div className="space-y-4">
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Payment Status</p>
									<span
										className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-light uppercase tracking-wider ${paymentStatus.bg} ${paymentStatus.text} ${paymentStatus.border}`}
									>
										<PaymentStatusIcon size={14} />
										{buyback.paymentStatus || "Pending"}
									</span>
								</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light uppercase tracking-wider bg-gray-50 text-gray-700 border border-gray-200">
										<CreditCard size={12} />
										{buyback.paymentMethod || "N/A"}
									</span>
								</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
									<p className="text-base font-light text-black">
										{buyback.amount !== null && buyback.amount !== undefined
											? formatCurrency(buyback.amount, buyback.currency)
											: formatCurrency(0, buyback.currency)}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Loyalty Points</p>
									<div className="flex items-center gap-1.5">
										<Star size={16} className="text-yellow-500" fill="currentColor" />
										<p className="text-base font-light text-black">
											{buyback.loyaltyPoints !== null && buyback.loyaltyPoints !== undefined ? buyback.loyaltyPoints : 0}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Condition Assessment */}
						{buyback.quiz && buyback.quiz.length > 0 && (
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h3 className="text-sm font-light text-black uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
									Condition Assessment
								</h3>
								<div className="space-y-3">
									{buyback.quiz.map((q, qIdx) => (
										<div key={qIdx} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
											<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{q.ques}</p>
											<p className="text-sm font-light text-black">{q.ans}</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BuybackDetails;

