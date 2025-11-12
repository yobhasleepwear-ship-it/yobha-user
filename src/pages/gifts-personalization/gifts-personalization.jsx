import React from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Sparkles, ArrowRight } from "lucide-react";

const GiftsPersonalization = () => {
  const navigate = useNavigate();

  const options = [
    {
      id: "personalize",
      title: "Personalize Your Product",
      description: "Add a personal touch to your favorite YOBHA products with custom personalization options",
      route: "/personalization",
      icon: Sparkles,
    },
    {
      id: "purchase",
      title: "Purchase Gift Card",
      description: "Gift for loved ones - Share the gift of luxury with a YOBHA gift card",
      route: "/gift-card-purchase",
      icon: Gift,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      {/* Hero Section */}
      <section className="border-b border-gray-200 py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-black uppercase tracking-widest mb-4 font-futura-pt-light">
              Gifts & Personalization
            </h1>
            <p className="text-text-medium text-base md:text-lg font-light tracking-wide font-futura-pt-light">
              Make every gift special with our personalized options
            </p>
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {options.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(option.route)}
                >
                  <div className="bg-white border border-gray-200 hover:border-black transition-all duration-300 h-full flex flex-col">
                    {/* Icon Section */}
                    <div className="p-8 md:p-12 lg:p-16 border-b border-gray-100 flex items-center justify-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent 
                          size={36}
                          className="text-white" 
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-10 lg:p-12 flex flex-col flex-1">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black uppercase tracking-widest mb-4 font-futura-pt-light">
                        {option.title}
                      </h2>
                      <p className="text-text-medium text-sm md:text-base lg:text-lg font-light leading-relaxed mb-8 flex-1 font-futura-pt-light">
                        {option.description}
                      </p>

                      {/* CTA Button */}
                      <div className="flex items-center gap-2 text-black group-hover:gap-4 transition-all duration-300">
                        <span className="text-sm uppercase tracking-widest font-light font-futura-pt-light">
                          Explore
                        </span>
                        <ArrowRight 
                          size={18} 
                          className="group-hover:translate-x-2 transition-transform duration-300" 
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GiftsPersonalization;

