import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SCRUNCHIES from "../../../assets/SCRUNCHIES.jpg";
import Socks from "../../../assets/SOCKS.jpg";
import headband from "../../../assets/HEADBAND.jpg";
import eyemask from "../../../assets/EYEMASKS.jpg";
import cushions from "../../../assets/CUSHIONS.jpg";
import BATHROBE_IMAGE from "../../../assets/bathrobe.jpg"
import TOWELS_IMAGE from "../../../assets/towel.jpg"

const AccessoriesSection = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  // Define all accessories categories with their details
  const accessoriesCategories = [
    {
      id: "scrunchies",
      title: "Scrunchies",
      description: "Elegant hair accessories for every style",
      // image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjcnVuY2hpZXM8L3RleHQ+Cjwvc3ZnPg==",
      image:SCRUNCHIES,
      gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
      featured: true // Featured accessory
    },
    {
      id: "socks",
      title: "Socks",
      description: "Premium comfort for your feet",
      image:Socks,
      // image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNvY2tzPC90ZXh0Pgo8L3N2Zz4=",
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      featured: true // Featured accessory
    },
    {
      id: "eyemasks",
      title: "Eye Masks",
      description: "Luxury sleep accessories for better rest",
      image:eyemask,
      // image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV5ZSBNYXNrczwvdGV4dD4KPC9zdmc+",
      gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      featured: false
    },
    {
      id: "headband",
      title: "Headbands",
      description: "Sophisticated hair styling essentials",
      image:headband,
      // image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhlYWRiYW5kczwvdGV4dD4KPC9zdmc+",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      featured: false
    },
    {
      id: "cushions",
      title: "Cushions",
      description: "Decorative comfort for your home",
      image:cushions,
      // image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkN1c2hpb25zPC90ZXh0Pgo8L3N2Zz4=",
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      featured: false
    },
    {
      id: "bathrobe",
      title: "Bathrobe",
      description: "Luxury comfort for relaxation",
      image: BATHROBE_IMAGE,
      gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
      featured: true
    },
    {
      id: "towels",
      title: "Towels",
      description: "Premium softness for daily comfort",
      image: TOWELS_IMAGE,
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      featured: false
    }
  ];

  const handleNavigate = (category) => {
    navigate(`/products/${category.toLowerCase()}`);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 overflow-hidden"
      style={{ fontFamily: "'SweetSans', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif" }}
    >
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-luxury-gold/30 rotate-45"></div>
        <div className="absolute top-20 right-16 w-16 h-16 border border-luxury-gold/30 rotate-12"></div>
        <div className="absolute bottom-16 left-16 w-18 h-18 border border-luxury-gold/30 -rotate-12"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 border border-luxury-gold/30 rotate-45"></div>
      </div>

      {/* Section Header - Premium Typography */}
      <div className="relative z-10 text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
        <div className="overflow-hidden">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 uppercase tracking-widest mb-4 sm:mb-6 transform translate-y-0 opacity-100 transition-all duration-1000">
            Accessories
          </h2>
        </div>
        <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-6 sm:mb-8"></div>
        <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed px-4">
          Essential luxury accessories crafted for elevated living
        </p>
      </div>

      {/* Premium Accessories Showcase - Enhanced Mobile Responsiveness */}
        <div className="space-y-1 md:space-y-1.5 lg:space-y-2">
          {/* Featured Accessories - Large Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 lg:gap-3">
          {accessoriesCategories.filter(cat => cat.featured).map((category, index) => (
            <article
              key={category.id}
              className="group bg-white/95 backdrop-blur-sm border border-gray-100/50 overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 flex flex-col relative transform hover:-translate-y-2"
              onClick={() => handleNavigate(category.id)}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onTouchStart={(e) => {
                e.preventDefault();
                setHoveredCard(category.id);
              }}
              onTouchEnd={() => setHoveredCard(null)}
              onTouchCancel={() => setHoveredCard(null)}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              {/* Luxury Gold Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              
                <div className="relative h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px] xl:h-[320px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={category.image}
                      alt={`${category.title} Collection`}
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === category.id 
                          ? 'scale-110 rotate-2' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === category.id 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+";
                      }}
                    />
                  </div>
                  
                  {/* Premium Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent ${category.gradient} group-hover:from-black/70 transition-all duration-700`}></div>
                  
                  {/* Premium Border Effect */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  {/* Content positioned at bottom with premium styling */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 md:p-3">
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-white uppercase mb-1 sm:mb-2 md:mb-3 group-hover:scale-105 transition-transform duration-500 tracking-widest">
                      {category.title}
                    </div>
                    <div className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4 font-light tracking-wide leading-relaxed">
                      {category.description}
                    </div>
                    <div className="text-luxury-gold text-xs sm:text-sm uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 flex items-center gap-2">
                      <span>Explore Collection</span>
                      <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </div>
                  </div>
                </div>
            </article>
          ))}
        </div>

        {/* Regular Accessories - Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-2.5">
          {accessoriesCategories.filter(cat => !cat.featured).map((category, index) => (
            <article
              key={category.id}
              className="group bg-white/95 backdrop-blur-sm border border-gray-100/50 overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 flex flex-col relative transform hover:-translate-y-2"
              onClick={() => handleNavigate(category.id)}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onTouchStart={(e) => {
                e.preventDefault();
                setHoveredCard(category.id);
              }}
              onTouchEnd={() => setHoveredCard(null)}
              onTouchCancel={() => setHoveredCard(null)}
              style={{
                animationDelay: `${(index + 3) * 150}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              {/* Luxury Gold Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              
                <div className="relative h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] xl:h-[180px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={category.image}
                      alt={`${category.title} Collection`}
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === category.id 
                          ? 'scale-110 rotate-1' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === category.id 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+";
                      }}
                    />
                  </div>
                  
                  {/* Premium Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent ${category.gradient} group-hover:from-black/70 transition-all duration-700`}></div>
                  
                  {/* Premium Border Effect */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-2 right-2 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  {/* Content positioned at bottom with premium styling */}
                  <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 md:p-2">
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-light text-white uppercase mb-0.5 sm:mb-1 group-hover:scale-105 transition-transform duration-500 tracking-widest">
                      {category.title}
                    </div>
                    <div className="text-white/90 text-xs sm:text-sm md:text-base line-clamp-2 font-light tracking-wide leading-relaxed">
                      {category.description}
                    </div>
                  </div>
                </div>
            </article>
          ))}
        </div>
      </div>


      {/* Premium Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floatImage {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .group:active {
            transform: scale(0.98) !important;
          }
          
          .group:active img {
            animation: floatImage 2s ease-in-out infinite !important;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 768px) and (max-width: 1024px) {
          .group:hover {
            transform: translateY(-4px) !important;
          }
          
          .group:hover img {
            animation: floatImage 3s ease-in-out infinite !important;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-floatImage {
          animation: floatImage 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default AccessoriesSection;
