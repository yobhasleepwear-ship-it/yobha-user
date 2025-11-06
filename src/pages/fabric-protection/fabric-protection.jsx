import React from "react";

const FabricProtection = () => {
  const antiMicrobialData = {
    title: "Anti-Microbial Assurance",
    subtitle: "Freshness Curated For Everyday Rituals",
    description:
      "Crafted for the connoisseur who values purity, our anti-microbial process inhibits microbial growth so your garments stay fresher for longer. It is a thoughtful touch that keeps your wardrobe feeling pristine from the first wear to the fiftieth.",
    highlights: [
      "Lab-tested finish that actively diminishes microbial growth",
      "Breathable, hypoallergenic treatment that respects sensitive skin",
      "Durable performance paired with effortless maintenance"
    ],
    features: [
      {
        title: "Advanced Protection",
        description: "Our lab-tested finish actively reduces microbial growth, ensuring your garments stay fresher longer with every wear."
      },
      {
        title: "Skin-Friendly",
        description: "Breathable and hypoallergenic treatment designed to respect sensitive skin while maintaining fabric integrity."
      },
      {
        title: "Long-Lasting",
        description: "Durable performance that withstands repeated washes without compromising the protective finish or fabric quality."
      },
      {
        title: "Effortless Care",
        description: "Maintain the natural sheen and hand-feel of our signature fabrics with simple, everyday care routines."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-premium-cream font-sweet-sans">
      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16 bg-white font-sweet-sans">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-6 font-sweet-sans">
              Fabric Protection
            </h1>
            <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-4 md:mb-6" />
            <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
              Discover the invisible craftsmanship behind every indulgent layer. Our advanced treatments preserve the elegance of silk while adding a quiet assurance of purity.
            </p>
          </div>
        </div>
      </section>

      {/* Anti-Microbial Section */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20 lg:py-24 bg-premium-cream font-sweet-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
            {/* Left Column - Content */}
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4 font-light">
                Signature Process
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 font-sweet-sans">
                {antiMicrobialData.title}
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-700 font-light tracking-wide mb-8 leading-relaxed">
                {antiMicrobialData.subtitle}
              </p>
              
              <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light tracking-wide leading-relaxed mb-10">
                {antiMicrobialData.description}
              </p>

              {/* Highlights */}
              <div className="space-y-4">
                {antiMicrobialData.highlights.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0">
                    <div className="w-1 h-1 bg-gray-900 mt-2 flex-shrink-0" />
                    <p className="text-sm md:text-base text-gray-700 font-light tracking-wide leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="space-y-6">
              {antiMicrobialData.features.map((feature, index) => (
                <div
                  key={index}
                  className="border border-gray-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <h3 className="text-sm md:text-base font-light text-gray-900 uppercase tracking-[0.2em] mb-3 font-sweet-sans">
                    {feature.title}
                  </h3>
                  <div className="w-12 h-px bg-gray-300 mb-4" />
                  <p className="text-sm md:text-base text-gray-600 font-light tracking-wide leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20 lg:py-24 bg-white font-sweet-sans">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4 font-light">
            Care Philosophy
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8 font-sweet-sans">
            Crafted For Conscious Luxury
          </h3>
          <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-6 md:mb-8" />
          <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light tracking-wide leading-relaxed max-w-3xl mx-auto">
            Each finish is meticulously tested to harmonise science with comfort, ensuring every piece you embrace embodies the poise and purity of the YOBHA universe.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FabricProtection;
