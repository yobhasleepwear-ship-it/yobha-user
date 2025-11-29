import React from "react";
import FAQ from "../../comman/faq/faq";

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-premium-beige via-premium-cream to-premium-warm-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border border-luxury-gold/30 rotate-45"></div>
          <div className="absolute top-20 right-16 w-16 h-16 border border-luxury-gold/30 rotate-12"></div>
          <div className="absolute bottom-16 left-16 w-18 h-18 border border-luxury-gold/30 -rotate-12"></div>
          <div className="absolute bottom-10 right-10 w-14 h-14 border border-luxury-gold/30 rotate-45"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black mb-4 font-futura-pt-book">
            FAQ
          </h1>
          <p className="text-black text-sm md:text-base font-light max-w-2xl mx-auto font-futura-pt-light">
            Find answers to frequently asked questions about YOBHA's luxury sleepwear and lifestyle products.
          </p>
        </div>
      </section>

      {/* FAQ Component */}
      <FAQ />
    </div>
  );
};

export default FAQPage;


