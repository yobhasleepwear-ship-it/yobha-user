import React from "react";
import logo from "../../assets/yobhaLogo1.png";
const About = () => {
  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      {/* Hero Section - Compact */}
      <section className="relative py-8 bg-gradient-to-br from-premium-beige via-premium-cream to-premium-warm-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black mb-4 font-futura-pt-book">
            Why YOBHA
            </h1>
            <p className="text-black text-sm md:text-base font-light font-futura-pt-light">
              Redefining the essence of modern comfort
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Compact */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black mb-6 font-futura-pt-book">
                YOBHA
              </h2>
            </div>
            
            <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
              "We create pieces that honor the quiet beauty of comfort — refined essentials that bring peace and elegance to life's everyday rituals.
            </p>
            
            <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
              With a design-first approach and uncompromising attention to detail, YOBHA blends luxury craftsmanship with effortless wearability. Each piece is thoughtfully made to celebrate stillness, softness, and the art of being at home — within yourself and your space.
            </p>
            
            <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
              Guided by conscious creation and timeless design, YOBHA stands for a new kind of luxury — one that feels as good as it looks, and endures beyond seasons."
            </p>
          </div>

          {/* Visual Element - Compact */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-premium-beige to-premium-warm-white border border-text-light/20 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 border-2 border-luxury-gold rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-luxury-gold">
                      <img src={logo} alt="YOBHA Logo" className="w-16 h-16 object-contain" />
                    </span>
                  </div>
                  <p className="text-black text-sm font-light font-futura-pt-light">
                    Luxury Redefined
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Compact */}
      <section className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
              Our Philosophy
            </h2>
            <div className="w-16 h-1 bg-luxury-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
                Beyond Sleep
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
                YOBHA extends beyond sleep. Our world embraces loungewear, homewear, daywear, kidswear, and petwear, crafting a seamless universe of elevated essentials that connect you to your most authentic, grounded self.
              </p>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
                Home as State of Mind
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
                At YOBHA, home becomes a state of mind — and comfort becomes couture. Every piece is designed to create a sanctuary of tranquility and elegance in your daily life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Compact */}
      <section className="bg-premium-beige py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
              Our Values
            </h2>
            <div className="w-16 h-1 bg-luxury-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
                Tranquility
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
                Creating peaceful moments through thoughtful design and serene aesthetics.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-xl">🎨</span>
              </div>
              <h3 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
                Elegance
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
                Timeless silhouettes that celebrate the art of being effortlessly sophisticated.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <h3 className="text-base md:text-lg font-light text-black mb-3 font-futura-pt-book">
                Comfort
              </h3>
              <p className="text-black text-sm md:text-base leading-relaxed font-light font-futura-pt-light">
                Elevated essentials that connect you to your most authentic, grounded self.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
