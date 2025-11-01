import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MEN_IMAGE from "../../../assets/Men.png";
import WOMEN_IMAGE from "../../../assets/Women.png";
import KID_IMAGE from "../../../assets/kids-hero.jpg";
import PET_IMAGE from "../../../assets/pet-hero.jpg";
import COUPLE_IMAGE from "../../../assets/couple-hero1.jpg";
import FAMILY_IMAGE from "../../../assets/family-hero.jpg";

const GenderGrid = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  const genderCategories = [
    {
      id: "Women",
      title: "Women",
      description: "The art of elegance and grace",
      image: WOMEN_IMAGE,
      gradient: "from-pink-500/20 via-purple-500/10 to-transparent",
      size: "large",
    },
    {
      id: "men",
      title: "Men",
      description: "Classic sophistication redefined",
      image: MEN_IMAGE,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      size: "large",
    },
    {
      id: "kids",
      title: "Kids",
      description: "Playful comfort for little ones",
      image: KID_IMAGE,
      gradient: "from-yellow-500/20 via-orange-500/10 to-transparent",
      size: "medium",
    },
    {
      id: "pets",
      title: "Pets",
      description: "Luxury comfort for your furry friends",
      image: PET_IMAGE,
      gradient: "from-green-500/20 via-teal-500/10 to-transparent",
      size: "medium",
    },
    {
      id: "couple",
      title: "Couple",
      description: "Matching elegance for two",
      image: COUPLE_IMAGE,
      gradient: "from-red-500/20 via-pink-500/10 to-transparent",
      size: "small",
    },
    {
      id: "family",
      title: "Family",
      description: "Comfort for the whole family",
      image: FAMILY_IMAGE,
      gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
      size: "small",
    },
  ];

  const handleNavigate = (category) => {
    navigate(`/products/${category}`);
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-gradient-to-br from-yellow-50/30 via-amber-50/20 to-orange-50/30 overflow-hidden"
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
      <div className="relative z-10 text-center mb-12 md:mb-16">
        <div className="overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 uppercase tracking-widest mb-6 transform translate-y-0 opacity-100 transition-all duration-1000">
          Indulge in Luxury
        </h2>
        </div>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
        <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-3xl mx-auto font-light tracking-wide leading-relaxed">
          Discover timeless elegance, curated collections, and the art of refined living.  
          Every choice whispers sophistication, every detail sparkles.
        </p>
      </div>

      {/* Responsive Grid */}
        <div className="space-y-1 sm:space-y-0">
        {/* Mobile Layout - 2 Columns Grid */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {genderCategories.map((category, index) => {
              const slogans = {
                large: "Step into elegance →",
                medium: "Curated for you →",
                small: "Luxury at a glance →",
              };
              return (
              <article
                key={category.id}
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 transform hover:-translate-y-2"
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
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Gold Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>

                {/* Image Container - Auto Moving Images */}
                <div className="relative h-[150px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+";
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

                  {/* Text Overlay - Mobile Premium */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex flex-col items-start">
                      <div className="text-sm font-light text-white uppercase mb-1 text-left tracking-widest group-hover:scale-105 transition-transform duration-500">
                        {category.title}
                      </div>
                      <div className="text-white/90 text-xs tracking-wide mb-2 text-left font-light leading-relaxed">
                        {category.description}
                      </div>
                      <div className="text-luxury-gold text-[10px] uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>{slogans[category.size].replace(' →', '')}</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </div>

        {/* Tablet Layout - 2x3 Grid */}
        <div className="hidden sm:block md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {/* Large Cards - Full Width */}
            <article
              className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 col-span-2 transform hover:-translate-y-2"
              onClick={() => handleNavigate("Women")}
              onMouseEnter={() => setHoveredCard("Women")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '0ms',
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 overflow-hidden">
                <img
                  src={WOMEN_IMAGE}
                  alt="Women Collection"
                    className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                      hoveredCard === "Women" 
                        ? 'scale-110 rotate-2' 
                        : 'scale-100 rotate-0'
                    }`}
                    style={{
                      animation: hoveredCard === "Women" 
                        ? 'floatImage 3s ease-in-out infinite' 
                        : 'none'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-pink-500/20 via-purple-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-2xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                      Women
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                      The art of elegance and grace
                    </div>
                    <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                      <span>Step into elegance</span>
                      <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 col-span-2 transform hover:-translate-y-2"
              onClick={() => handleNavigate("men")}
              onMouseEnter={() => setHoveredCard("men")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '200ms',
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 overflow-hidden">
                <img
                  src={MEN_IMAGE}
                  alt="Men Collection"
                    className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                      hoveredCard === "men" 
                        ? 'scale-110 rotate-2' 
                        : 'scale-100 rotate-0'
                    }`}
                    style={{
                      animation: hoveredCard === "men" 
                        ? 'floatImage 3s ease-in-out infinite' 
                        : 'none'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-blue-500/20 via-indigo-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-2xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                      Men
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                      Classic sophistication redefined
                    </div>
                    <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                      <span>Step into elegance</span>
                      <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Medium Cards - 1 column each */}
            <article
              className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 transform hover:-translate-y-2"
              onClick={() => handleNavigate("kids")}
              onMouseEnter={() => setHoveredCard("kids")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '400ms',
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[150px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 overflow-hidden">
                <img
                  src={KID_IMAGE}
                  alt="Kids Collection"
                    className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                      hoveredCard === "kids" 
                        ? 'scale-110 rotate-1' 
                        : 'scale-100 rotate-0'
                    }`}
                    style={{
                      animation: hoveredCard === "kids" 
                        ? 'floatImage 3s ease-in-out infinite' 
                        : 'none'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-yellow-500/20 via-orange-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                      Kids
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                      Playful comfort for little ones
                    </div>
                    <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                      <span>Curated for you</span>
                      <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white"
              onClick={() => handleNavigate("pets")}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[150px] overflow-hidden bg-premium-cream">
                <img
                  src={PET_IMAGE}
                  alt="Pets Collection"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent from-green-500/20 via-teal-500/10 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-luxury-gold/30 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-xl font-bold text-white uppercase  mb-2 group-hover:scale-105 transition-transform duration-300 text-left">
                      Pets
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left">
                      Luxury comfort for your furry friends
                    </div>
                    <div className="text-luxury-gold text-xs uppercase  group-hover:text-white transition-colors duration-300 text-left">
                      Curated for you →
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Small Cards - 1 column each with consistent sizing */}
            <article
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white"
              onClick={() => handleNavigate("couple")}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[150px] overflow-hidden bg-premium-cream">
                <img
                  src={COUPLE_IMAGE}
                  alt="Couple Collection"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent from-red-500/20 via-pink-500/10 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-luxury-gold/30 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-xl font-bold text-white uppercase  mb-2 group-hover:scale-105 transition-transform duration-300 text-left">
                      Couple
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left">
                      Matching elegance for two
                    </div>
                    <div className="text-luxury-gold text-xs uppercase  group-hover:text-white transition-colors duration-300 text-left">
                      Luxury at a glance →
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white"
              onClick={() => handleNavigate("family")}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
              <div className="relative h-[150px] overflow-hidden bg-premium-cream">
                <img
                  src={FAMILY_IMAGE}
                  alt="Family Collection"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent from-indigo-500/20 via-purple-500/10 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-luxury-gold/30 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex flex-col items-start">
                    <div className="text-xl font-bold text-white uppercase  mb-2 group-hover:scale-105 transition-transform duration-300 text-left">
                      Family
                    </div>
                    <div className="text-white/90 text-sm tracking-wide mb-2 text-left">
                      Comfort for the whole family
                    </div>
                    <div className="text-luxury-gold text-xs uppercase  group-hover:text-white transition-colors duration-300 text-left">
                      Luxury at a glance →
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Desktop Layout - Mixed Grid (2 + 4 columns) */}
        <div className="hidden md:block">
          <div className="space-y-2">
            {/* Row 1: Women & Men - 2 Columns */}
            <div className="grid grid-cols-2 gap-2">
              {/* Women - Half Width Card */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("Women")}
                onMouseEnter={() => setHoveredCard("Women")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '0ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[500px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={WOMEN_IMAGE}
                    alt="Women Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "Women" 
                          ? 'scale-110 rotate-2' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "Women" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-pink-500/20 via-purple-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-6 right-6 w-2 h-2 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col items-start">
                      <div className="text-4xl font-light text-white uppercase mb-3 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Women
                      </div>
                      <div className="text-white/90 text-lg tracking-wide mb-3 text-left font-light leading-relaxed">
                        The art of elegance and grace
                      </div>
                      <div className="text-luxury-gold text-sm uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Step into elegance</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Men - Half Width Card */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("men")}
                onMouseEnter={() => setHoveredCard("men")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '200ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[500px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={MEN_IMAGE}
                    alt="Men Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "men" 
                          ? 'scale-110 rotate-2' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "men" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-blue-500/20 via-indigo-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-6 right-6 w-2 h-2 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col items-start">
                      <div className="text-4xl font-light text-white uppercase mb-3 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Men
                      </div>
                      <div className="text-white/90 text-lg tracking-wide mb-3 text-left font-light leading-relaxed">
                        Classic sophistication redefined
                      </div>
                      <div className="text-luxury-gold text-sm uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Step into elegance</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Row 2: Kids, Couple, Family, Pets - 4 Columns */}
            <div className="grid grid-cols-4 gap-2">
              {/* Kids */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("kids")}
                onMouseEnter={() => setHoveredCard("kids")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '400ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={KID_IMAGE}
                    alt="Kids Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "kids" 
                          ? 'scale-110 rotate-1' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "kids" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-yellow-500/20 via-orange-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex flex-col items-start">
                      <div className="text-xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Kids
                      </div>
                      <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                        Playful comfort for little ones
                      </div>
                      <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Curated for you</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Couple */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("couple")}
                onMouseEnter={() => setHoveredCard("couple")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '500ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={COUPLE_IMAGE}
                    alt="Couple Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "couple" 
                          ? 'scale-110 rotate-1' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "couple" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-red-500/20 via-pink-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex flex-col items-start">
                      <div className="text-xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Couple
                      </div>
                      <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                        Matching elegance for two
                      </div>
                      <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Luxury at a glance</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Family */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("family")}
                onMouseEnter={() => setHoveredCard("family")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '600ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={FAMILY_IMAGE}
                    alt="Family Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "family" 
                          ? 'scale-110 rotate-1' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "family" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-indigo-500/20 via-purple-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex flex-col items-start">
                      <div className="text-xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Family
                      </div>
                      <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                        Comfort for the whole family
                      </div>
                      <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Luxury at a glance</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Pets */}
              <article
                className="group relative overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 bg-white/95 backdrop-blur-sm border border-gray-100/50 flex flex-col transform hover:-translate-y-2"
                onClick={() => handleNavigate("pets")}
                onMouseEnter={() => setHoveredCard("pets")}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: '700ms',
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>
                <div className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={PET_IMAGE}
                    alt="Pets Collection"
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === "pets" 
                          ? 'scale-110 rotate-1' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === "pets" 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent from-green-500/20 via-teal-500/10 to-transparent group-hover:from-black/70 transition-all duration-700"></div>
                  <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex flex-col items-start">
                      <div className="text-xl font-light text-white uppercase mb-2 group-hover:scale-105 transition-transform duration-500 text-left tracking-widest">
                        Pets
                      </div>
                      <div className="text-white/90 text-sm tracking-wide mb-2 text-left font-light leading-relaxed">
                        Luxury comfort for your furry friends
                      </div>
                      <div className="text-luxury-gold text-xs uppercase font-light tracking-widest group-hover:text-white transition-colors duration-500 text-left flex items-center gap-2">
                        <span>Curated for you</span>
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
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

export default GenderGrid;
