import React, { useState, useEffect } from "react";
import TrendingNewArrivals from './components/TrendingNewArrivals';
import GenderGrid from './components/GenderGrid';
import AccessoriesSection from './components/AccessoriesSection';
import { Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  const [showFloatingElements, setShowFloatingElements] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [recentVisited, setRecentVisited] = useState([]);
  // Video URLs
  const portraitVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";
  const landscapeVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";

  useEffect(() => {
    // Show floating elements after component mounts
    const timer = setTimeout(() => {
      setShowFloatingElements(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check screen orientation and size
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth ||
        (window.innerWidth < 768 && window.innerHeight > window.innerWidth);
      setIsPortrait(isPortraitMode);
    };

    // Initial check
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("recentVisited");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentVisited(parsed);
        }
      } catch (err) {
        console.error("Error parsing recentVisited:", err);
      }
    }
  }, []);
  return (
    <div className="relative min-h-screen bg-[#FAF6F2]">
      {recentVisited.length > 0 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-[75%] md:w-[65%] text-center">
          {/* Title */}
          <h2 className="text-white text-sm sm:text-base md:text-lg font-light tracking-[0.2em] uppercase mb-4 drop-shadow-sm">
            Your Recent Visit
          </h2>

          {/* Carousel */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 py-4 px-5 overflow-x-auto flex gap-6 justify-center items-center no-scrollbar">
            {recentVisited.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/productDetail/${item.id}`)}
                className="group relative w-24 sm:w-28 md:w-32 shrink-0 transition-all duration-500 hover:scale-110 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-gray-200/70 shadow-md transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(234,84,48,0.4)] group-hover:border-[#ea5430]/70">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay gradient with text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end justify-center p-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-white text-[10px] sm:text-xs md:text-sm font-light tracking-wide uppercase text-center leading-tight">
                      {item.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden z-0">

        {/* Background Video */}
        <video
          src={isPortrait ? portraitVideo : landscapeVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          key={isPortrait ? 'portrait' : 'landscape'}
        />

        {/* Enhanced Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div> */}

        {/* Animated Background Pattern */}
        {/* <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/20 via-transparent to-luxury-rose-gold/20 animate-pulse"></div>
        </div> */}

    



      </section>

      {/* Sections below video */}
      <div className="space-y-0">
        <GenderGrid />
        <AccessoriesSection />
        <TrendingNewArrivals />
      </div>
    </div>
  );
};

export default HomePage;
