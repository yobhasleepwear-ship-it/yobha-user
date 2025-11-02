import React, { useState, useEffect } from "react";
import TrendingNewArrivals from './components/TrendingNewArrivals';
import GenderGrid from './components/GenderGrid';
import AccessoriesSection from './components/AccessoriesSection';
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(false);
  const [recentVisited, setRecentVisited] = useState([]);
  // Video URLs
  const portraitVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";
  const landscapeVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";

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
          const seen = new Set();
          const unique = [];
          for (let i = parsed.length - 1; i >= 0; i -= 1) {
            const item = parsed[i];
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              unique.unshift(item);
            }
          }
          setRecentVisited(unique.slice(-6));
        }
      } catch (err) {
        console.error("Error parsing recentVisited:", err);
      }
    }
  }, []);

  const isSingleRecent = recentVisited.length === 1;
  const isCarousel = recentVisited.length > 1;
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

      {recentVisited.length > 0 && (
        <section
          className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-14 md:py-16 font-sweet-sans"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fef8f4] to-[#f4e6dc] opacity-90" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-10 h-20 w-20 border border-luxury-gold/25 rotate-6" />
            <div className="absolute bottom-8 right-12 h-24 w-24 border border-luxury-gold/25 -rotate-6" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <div className="text-center">
              <span className="uppercase tracking-[0.35em] text-[10px] sm:text-xs text-luxury-gold">Your Curated Picks</span>
              <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light uppercase tracking-[0.4em] text-gray-900">
                Recently Viewed
              </h2>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide max-w-2xl mx-auto">
                Revisit the pieces that caught your eye and continue curating your YOBHA wardrobe with ease.
              </p>
            </div>



            <div className="mt-10 sm:hidden">
              <div
                className={`w-full flex gap-4 pb-4 ${isCarousel ? 'overflow-x-auto scrollbar-hide snap-x snap-mandatory' : ''} ${isSingleRecent ? 'justify-center' : ''}`}
              >
                {recentVisited.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/productDetail/${item.id}`)}
                    className={`group flex-shrink-0 w-60 border border-gray-200/70 bg-white/85 backdrop-blur-sm shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden cursor-pointer transition-transform duration-500 hover:-translate-y-2 ${isCarousel ? 'snap-center' : ''} ${isSingleRecent ? 'mx-auto' : ''}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <p className="text-white/90 text-[11px] uppercase tracking-[0.3em]">YOBHA EDIT</p>
                        <h3 className="mt-1 text-sm text-white font-light uppercase tracking-[0.2em] leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <div className="px-4 py-4 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-gray-600">
                      <span>View Piece</span>
                      <span className="text-luxury-gold">→</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-10 hidden sm:block">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentVisited.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/productDetail/${item.id}`)}
                    className="group border border-gray-200/70 bg-white/90 backdrop-blur-sm shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden cursor-pointer transition-transform duration-500 hover:-translate-y-2"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <p className="text-white/90 text-[11px] uppercase tracking-[0.3em]">YOBHA EDIT</p>
                        <h3 className="mt-1 text-base text-white font-light uppercase tracking-[0.2em] leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <div className="px-5 py-5 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-gray-600">
                      <span>View Piece</span>
                      <span className="text-luxury-gold">→</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
