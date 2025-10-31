import React, { useState, useEffect } from "react";
import TrendingNewArrivals from './components/TrendingNewArrivals';
import GenderGrid from './components/GenderGrid';
import AccessoriesSection from './components/AccessoriesSection';
import { Sparkles, Star } from "lucide-react";

const HomePage = () => {
  const [showFloatingElements, setShowFloatingElements] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // Video URLs
  const portraitVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Ffinal.mp4?alt=media&token=0b6bd6b1-3771-4d9d-83af-26b7cd8fd6ca";
  const landscapeVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fyobha%20website%20video.mp4?alt=media&token=6d88e1ce-5ab6-4158-981a-35970966078a";

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

  return (
    <div className="relative min-h-screen bg-[#FAF6F2]">

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/20 via-transparent to-luxury-rose-gold/20 animate-pulse"></div>
        </div>

        {/* Floating Decorative Elements */}
        {showFloatingElements && (
          <>
            {/* Floating Sparkles - Hidden on mobile to reduce clutter */}
            <div className="hidden sm:block absolute top-20 left-10 animate-float-slow">
              <Sparkles size={16} className="text-luxury-gold/60 animate-pulse" />
            </div>
            <div className="hidden md:block absolute top-32 right-16 animate-float-medium">
              <Star size={12} className="text-luxury-rose-gold/50 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute bottom-40 left-20 animate-float-fast">
              <Sparkles size={14} className="text-luxury-gold/40 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute bottom-32 right-10 animate-float-slow">
              <Star size={10} className="text-luxury-rose-gold/60 animate-pulse" />
            </div>
            <div className="hidden lg:block absolute top-1/2 left-8 animate-float-medium">
              <Sparkles size={18} className="text-luxury-gold/30 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="hidden sm:block absolute top-1/3 right-8 animate-float-fast">
              <Star size={16} className="text-luxury-rose-gold/40 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>
          </>
        )}



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
