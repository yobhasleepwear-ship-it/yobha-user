import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLoyaltyAudit } from "../../service/wallet";
import { message } from "../../comman/toster-message/ToastContainer";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import * as localStorageService from "../../service/localStorageService";

// Toggle for dummy data - set to false to use real API
const USE_DUMMY_DATA = true;

// Count-up animation hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const startValue = countRef.current;
    const difference = end - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + difference * easeOutQuart);
      
      setCount(current);
      countRef.current = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const Wallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    balance: 0,
    recentActivity: [],
    impact: {
      renewed: 0,
      recycled: 0,
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const pageSize = 20;
  
  // Animated balance count
  const animatedBalance = useCountUp(walletData.balance, 2000);

  // Create dummy data for testing
  const createDummyData = () => {
    const dummyItems = [
      {
        id: "1",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "BuybackApproved",
        relatedEntityId: "BUYBACK001",
        operation: "Credit",
        points: 50,
        balanceAfter: 240,
        metadata: { adminId: "ADMIN001", note: "Approved buyback" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "BuybackApproved",
        relatedEntityId: "BUYBACK002",
        operation: "Credit",
        points: 30,
        balanceAfter: 190,
        metadata: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "RecycledGarment",
        relatedEntityId: "RECYCLE001",
        operation: "Credit",
        points: 15,
        balanceAfter: 160,
        metadata: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "OrderPayment",
        relatedEntityId: "ORD001",
        operation: "Debit",
        points: 50,
        balanceAfter: 145,
        metadata: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "BuybackApproved",
        relatedEntityId: "BUYBACK003",
        operation: "Credit",
        points: 40,
        balanceAfter: 195,
        metadata: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "RecycledGarment",
        relatedEntityId: "RECYCLE002",
        operation: "Credit",
        points: 20,
        balanceAfter: 155,
        metadata: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "7",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "OrderPayment",
        relatedEntityId: "ORD002",
        operation: "Debit",
        points: 30,
        balanceAfter: 135,
        metadata: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "8",
        userId: "USR123456",
        email: "user@example.com",
        phoneNumber: "+919876543210",
        reason: "BuybackApproved",
        relatedEntityId: "BUYBACK004",
        operation: "Credit",
        points: 35,
        balanceAfter: 165,
        metadata: null,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      totalCount: 8,
      page: 1,
      pageSize: 20,
      items: dummyItems,
    };
  };

  // Fetch wallet data
  const fetchWalletData = async (page = 1, append = false) => {
    try {
      setLoading(true);
      
      let response;
      if (USE_DUMMY_DATA) {
        // Use dummy data for testing
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        response = createDummyData();
      } else {
        // Use real API
        response = await getLoyaltyAudit(page, pageSize);
      }
      
      if (response && response.items) {
        // Get current balance from the most recent transaction (only on first load)
        let currentBalance = walletData.balance;
        if (!append && response.items.length > 0) {
          currentBalance = response.items[0].balanceAfter;
        }

        // Process recent activity
        const newActivity = response.items.map((item) => ({
          id: item.id,
          reason: item.reason,
          operation: item.operation,
          points: item.points,
          balanceAfter: item.balanceAfter,
          createdAt: item.createdAt,
        }));

        // Append or replace activities
        const updatedActivity = append 
          ? [...walletData.recentActivity, ...newActivity]
          : newActivity;

        // Calculate impact from all loaded items
        let renewedCount = 0;
        let recycledCount = 0;
        
        updatedActivity.forEach((item) => {
          if (item.operation === "Credit") {
            if (item.reason === "BuybackApproved" || item.reason?.toLowerCase().includes("renew")) {
              renewedCount++;
            }
            if (item.reason?.toLowerCase().includes("recycl")) {
              recycledCount++;
            }
          }
        });

        setWalletData({
          balance: currentBalance,
          recentActivity: updatedActivity,
          impact: {
            renewed: renewedCount,
            recycled: recycledCount,
          },
        });
        setTotalCount(response.totalCount || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      message.error("Unable to load wallet information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
    if (!token) {
      message.info("Please log in to view your wallet.");
      navigate("/login");
      return;
    }

    fetchWalletData(1);
    // Trigger visibility animation
    setTimeout(() => setIsVisible(true), 100);
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format reason text for display
  const formatReason = (reason, operation, points) => {
    if (operation === "Credit") {
      if (reason === "BuybackApproved") {
        return `+${points} Renewed Garment`;
      }
      if (reason?.toLowerCase().includes("recycl")) {
        return `+${points} Recycled Garment`;
      }
      return `+${points} ${reason || "Credit"}`;
    } else {
      if (reason === "OrderPayment") {
        return `-${points} Redeemed on Purchase`;
      }
      return `-${points} ${reason || "Debit"}`;
    }
  };

  // Handle action buttons
  const handleRedeemCredits = () => {
    // Navigate to checkout or redeem page
    navigate("/checkout");
  };

  const handleSubmitNewItem = () => {
    // Navigate to buyback page
    navigate("/buyback/create");
  };

  // Load more activities
  const loadMore = () => {
    if (walletData.recentActivity.length < totalCount && !loading) {
      fetchWalletData(currentPage + 1, true);
    }
  };

  if (loading && walletData.recentActivity.length === 0) {
    return (
      <div className="min-h-screen bg-white font-futura-pt-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-black text-base font-light font-futura-pt-light">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Page Title */}
        <h1 
          className={`text-2xl md:text-3xl font-light text-black mb-2 text-center transition-all duration-1000 font-futura-pt-book ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          My YOBHA Wallet
        </h1>
        {/* <p 
          className={`text-sm md:text-base font-light text-text-medium text-center mb-8 md:mb-12 leading-relaxed transition-all duration-1000 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          A clear, minimal and premium wallet experience
        </p> */}

        {/* YOUR BALANCE - Bold, clean and centered with animation */}
        <div 
          className={`text-center mb-12 md:mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative inline-block">
            <div className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-2 animate-pulse-slow font-futura-pt-book">
              {animatedBalance}
            </div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 text-5xl md:text-6xl lg:text-7xl font-light text-black/20 blur-xl -z-10 animate-glow font-futura-pt-book">
              {animatedBalance}
            </div>
          </div>
          <div className="text-sm md:text-base text-black font-light mt-2 font-futura-pt-light">
            Credits
          </div>
        </div>

        {/* RECENT ACTIVITY - Simple, one-line entries */}
        <div 
          className={`mb-12 md:mb-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-base md:text-lg font-light text-black mb-6 md:mb-8 font-futura-pt-book">
            Recent Activity
          </h2>
          <div className="space-y-3 md:space-y-4">
            {walletData.recentActivity.length === 0 ? (
              <div className="text-sm md:text-base font-light text-black text-center py-8 font-futura-pt-light">
                No activity yet
              </div>
            ) : (
              walletData.recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between py-2 md:py-3 border-b border-gray-100 transition-all duration-500 hover:bg-gray-50/50 hover:translate-x-1 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{
                    transitionDelay: `${600 + index * 50}ms`
                  }}
                >
                  <div className="flex-1">
                    <div className="text-sm md:text-base font-light text-black font-futura-pt-light">
                      {formatReason(activity.reason, activity.operation, activity.points)}
                    </div>
                    <div className="text-xs md:text-sm text-black mt-1 font-futura-pt-light">
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-black font-light ml-4 font-futura-pt-light">
                    Balance: {activity.balanceAfter}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Load More Button */}
          {walletData.recentActivity.length < totalCount && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="mt-6 text-sm text-black hover:text-black underline font-light transition-colors disabled:opacity-50 font-futura-pt-light"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>

        {/* YOUR IMPACT - Soft emotional line showing environmental impact */}
        <div 
          className={`mb-12 md:mb-16 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-base md:text-lg font-light text-black mb-4 md:mb-6 font-futura-pt-book">
            Your Impact
          </h2>
          <p className="text-sm md:text-base font-light text-black mb-4 md:mb-6 leading-relaxed font-futura-pt-light">
            You've helped reduce waste and protect the planet.
          </p>
          <div className="space-y-2 md:space-y-3">
            {walletData.impact.renewed > 0 && (
              <div 
                className={`text-sm md:text-base font-light text-black transition-all duration-500 delay-800 font-futura-pt-light ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                • {walletData.impact.renewed} {walletData.impact.renewed === 1 ? "item" : "items"} renewed
              </div>
            )}
            {walletData.impact.recycled > 0 && (
              <div 
                className={`text-sm md:text-base font-light text-black transition-all duration-500 delay-900 font-futura-pt-light ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                • {walletData.impact.recycled} {walletData.impact.recycled === 1 ? "item" : "items"} recycled
              </div>
            )}
            {walletData.impact.renewed === 0 && walletData.impact.recycled === 0 && (
              <div className="text-sm md:text-base font-light text-black font-futura-pt-light">
                • Start your journey by submitting items for renewal or recycling
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 md:gap-6 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleSubmitNewItem}
            className="flex-1 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-light text-black border border-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 transform font-futura-pt-light"
          >
            Submit New Item
          </button>
        </div>
      </div>

      {/* Custom Animations CSS */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0.2;
            filter: blur(15px);
          }
          50% {
            opacity: 0.3;
            filter: blur(20px);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Wallet;

