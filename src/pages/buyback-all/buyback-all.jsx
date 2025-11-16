import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBuybackDetails } from "../../service/buyback";

// Dummy data for testing UI when API returns empty array
const dummyRequests = [
	{
		id: 101,
		status: "Pending",
		productName: "Mulberry Silk Pillowcase",
		createdAt: new Date().toISOString(),
		amount: "₹1,200",
		notes: "Customer wants to trade-in a used pillowcase."
	},
	{
		id: 102,
		status: "Approved",
		productName: "Silk Scrunchies Set",
		createdAt: new Date(Date.now() - 86400000).toISOString(),
		amount: "₹600",
		notes: "Approved after quality check."
	},
	{
		id: 103,
		status: "Rejected",
		productName: "Silk Eye Mask",
		createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
		amount: "₹350",
		notes: "Not eligible due to visible damage."
	}
];

const BuybackAll = () => {
	const [requests, setRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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
					// For testing: if API returns empty, display dummy items
					setRequests(items.length > 0 ? items : []);
				}
			} catch (err) {
				if (isMounted) {
					setError("Failed to load buyback requests.");
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

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 font-futura-pt-light font-light">
			<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between mb-6">
				<div>
					<h1 className="text-xl md:text-2xl font-light text-gray-900">MY BUYBACK REQUESTS</h1>
					
				</div>
				<Link to="/buyback/create" className="text-sm text-black hover:underline  active:underline underline-offset-2">
					New Buyback
				</Link>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-16 text-gray-600">Loading buyback requests...</div>
			)}

			{!isLoading && error && (
				<div className="border border-red-200 bg-red-50 text-red-700  px-4 py-3">{error}</div>
			)}

			{!isLoading && !error && (!requests || requests.length === 0) && (
				<div className="border rounded-lg p-8 text-center bg-white">
					<p className="text-gray-600">No buyback requests found.</p>
					<div className="mt-2">
						<Link to="/buyback/create" className="text-sm text-black hover:underline active:underline underline-offset-2">
							Start a new buyback
						</Link>
					</div>
				</div>
			)}

			{!isLoading && !error && requests && requests.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5">
					{requests.map((req, idx) => (
						<div
							key={req?.id ?? idx}
							className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start">
								<div className="font-medium text-gray-900">Request #{req?.id ?? idx + 1}</div>
								{req?.status && (
									<span
										className={`text-xs px-2 py-0.5 rounded-full border
											${String(req.status).toLowerCase().includes("approve") || String(req.status).toLowerCase().includes("complete") ? "bg-green-50 text-green-700 border-green-200" : ""}
											${String(req.status).toLowerCase().includes("pending") ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
											${String(req.status).toLowerCase().includes("reject") || String(req.status).toLowerCase().includes("cancel") ? "bg-red-50 text-red-700 border-red-200" : ""}
											${!(String(req.status).toLowerCase().includes("approve") || String(req.status).toLowerCase().includes("complete") || String(req.status).toLowerCase().includes("pending") || String(req.status).toLowerCase().includes("reject") || String(req.status).toLowerCase().includes("cancel")) ? "bg-gray-50 text-gray-700 border-gray-200" : ""}
										`}
									>
										{req.status}
									</span>
								)}
							</div>
							<div className="mt-3 text-sm text-gray-700 space-y-1.5">
								{req?.productName && (
									<div>
										<span className="font-medium text-gray-900">Product: </span>
										{req.productName}
									</div>
								)}
								{req?.createdAt && (
									<div>
										<span className="font-medium text-gray-900">Created: </span>
										{new Date(req.createdAt).toLocaleString()}
									</div>
								)}
								{req?.amount && (
									<div>
										<span className="font-medium text-gray-900">Amount: </span>
										{req.amount}
									</div>
								)}
								{req?.notes && (
									<div className="text-gray-600">
										<span className="font-medium text-gray-900">Notes: </span>
										{req.notes}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default BuybackAll;


