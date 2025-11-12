import React from "react";
import { Sparkles } from "lucide-react";

const Personalization = () => {
  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      {/* Hero Section */}
      <section className="border-b border-gray-200 py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-black rounded-full flex items-center justify-center">
                <Sparkles 
                  size={36}
                  className="text-white" 
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-black uppercase tracking-widest mb-4 font-futura-pt-light">
              Personalize Your Product
            </h1>
            <p className="text-text-medium text-base md:text-lg font-light tracking-wide font-futura-pt-light">
              Add a personal touch to your favorite YOBHA products
            </p>
          </div>
        </div>
      </section>

      {/* Work in Progress Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-gray-200 p-12 md:p-16 lg:p-20 text-center">
            <div className="mb-8">
              <div className="inline-block border-2 border-black px-8 py-4 mb-6">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-black uppercase tracking-widest font-futura-pt-light">
                  Work in Progress
                </p>
              </div>
            </div>
            <p className="text-text-medium text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto font-futura-pt-light">
              We're currently working on bringing you amazing personalization features. 
              This feature will be available soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Personalization;

