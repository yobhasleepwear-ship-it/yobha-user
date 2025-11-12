import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SCRUNCHIES from "../../assets/SCRUNCHIES.jpg";
import Socks from "../../assets/SOCKS.jpg";
import headband from "../../assets/HEADBAND.jpg";
import eyemask from "../../assets/EYEMASKS.jpg";
import cushions from "../../assets/CUSHIONS.jpg";
import BATHROBE_IMAGE from "../../assets/bathrobe.jpg";
import TOWELS_IMAGE from "../../assets/towel.jpg";

const Accessories = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const accessoriesCategories = [
    { id: "scrunchies", title: "Scrunchies", image: SCRUNCHIES },
    { id: "socks", title: "Socks", image: Socks },
    { id: "eyemasks", title: "Eye Masks", image: eyemask },
    { id: "headband", title: "Headbands", image: headband },
    { id: "cushions", title: "Cushions", image: cushions },
    { id: "bathrobe", title: "Bathrobe", image: BATHROBE_IMAGE },
    { id: "towels", title: "Towels", image: TOWELS_IMAGE },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
              Accessories
            </h2>
            <div className="w-12 md:w-16 h-px bg-gray-300 mx-auto mb-4 md:mb-5" />
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto font-light leading-relaxed font-futura-pt-light">
              Discover timeless elegance across our curated collections
            </p>
          </div>

          {/* Grid Layout - Unique Minimal Design */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
            {accessoriesCategories.map((accessory, index) => (
              <div
                key={accessory.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredCard(accessory.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/products/${accessory.id.toLowerCase()}`)}
              >
                {/* Card Container - Clean Minimal Design with Unique Effects */}
                <div 
                  className="relative bg-white overflow-hidden transition-all duration-500"
                  style={{
                    transform: hoveredCard === accessory.id 
                      ? 'translateY(-4px)' 
                      : 'translateY(0)',
                  }}
                >
                  {/* Image Container with Unique Hover Effect */}
                  <div 
                    className="relative aspect-square overflow-hidden bg-gray-50 transition-all duration-500"
                    style={{
                      border: hoveredCard === accessory.id 
                        ? '1px solid rgba(0, 0, 0, 0.2)' 
                        : '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Image with smooth zoom and fade */}
                    <img
                      src={accessory.image}
                      alt={accessory.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out"
                      style={{
                        transform: hoveredCard === accessory.id 
                          ? 'scale(1.15)' 
                          : 'scale(1)',
                      }}
                    />

                    {/* Overlay that darkens slightly on hover */}
                    <div 
                      className="absolute inset-0 bg-black transition-opacity duration-500"
                      style={{
                        opacity: hoveredCard === accessory.id ? 0.03 : 0
                      }}
                    />

                    {/* Top border line that appears on hover */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-[1px] bg-black transition-all duration-500"
                      style={{
                        transform: hoveredCard === accessory.id 
                          ? 'scaleX(1)' 
                          : 'scaleX(0)',
                        transformOrigin: 'center'
                      }}
                    />
                  </div>

                  {/* Content Section - Minimal Typography */}
                  <div className="pt-4 pb-4 px-3 bg-white">
                    <h3 
                      className="text-[10px] sm:text-[11px] md:text-xs font-light text-black uppercase text-center transition-all duration-300 font-futura-pt-light"
                      style={{
                        transform: hoveredCard === accessory.id 
                          ? 'translateY(-1px)' 
                          : 'translateY(0)'
                      }}
                    >
                      {accessory.title}
                    </h3>
                    
                    {/* Minimal centered underline */}
                    <div className="mt-3 flex justify-center">
                      <div 
                        className="h-[0.5px] bg-gray-400 transition-all duration-500"
                        style={{
                          width: hoveredCard === accessory.id ? '28px' : '0px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accessories;
