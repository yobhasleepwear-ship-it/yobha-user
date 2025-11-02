import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const sectionData = [
  {
    id: "anti-viral",
    title: "Anti-Viral Protection",
    subtitle: "Engineered Defense, Everyday Luxury",
    description:
      "Our anti-viral treatment is designed to create a protective barrier that neutralises commonly encountered viruses on contact. While the science works silently, you enjoy the same indulgent softness, graceful drape, and breathable comfort YOBHA is known for.",
    highlights: [
      "Advanced multi-layer micro-coating that is gentle on skin",
      "Designed to withstand repeated washes without compromising the finish",
      "Maintains the natural sheen and hand-feel of our signature fabrics"
    ],
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce fermentum augue vitae vehicula placerat. Phasellus tellus nibh, suscipit at interdum in, efficitur vel ligula. Integer velit ante, sodales id bibendum congue, convallis eu leo. Vestibulum viverra hendrerit nisl, ut aliquet mi efficitur ac. Praesent et tincidunt lorem. Nunc dignissim ultrices augue quis facilisis. Cras ac varius erat, nec blandit dolor. Donec nec consequat lacus. Maecenas faucibus, turpis vel dictum tincidunt, metus dolor condimentum risus, vel tincidunt ante nunc ac ipsum."
  },
  {
    id: "anti-microbial",
    title: "Anti-Microbial Assurance",
    subtitle: "Freshness Curated For Everyday Rituals",
    description:
      "Crafted for the connoisseur who values purity, our anti-microbial process inhibits microbial growth so your garments stay fresher for longer. It is a thoughtful touch that keeps your wardrobe feeling pristine from the first wear to the fiftieth.",
    highlights: [
      "Lab-tested finish that actively diminishes microbial growth",
      "Breathable, hypoallergenic treatment that respects sensitive skin",
      "Durable performance paired with effortless maintenance"
    ],
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vel efficitur arcu. Integer arcu diam, egestas eget felis a, lacinia consequat velit. Proin suscipit lacinia sem id pellentesque. Integer aliquet arcu massa, vitae sagittis orci luctus at. Nunc porttitor nunc nec est sollicitudin, ac tempus libero congue. Quisque interdum turpis vitae sapien tempus, id laoreet sem varius. Suspendisse nibh dolor, tempor sed quam eu, feugiat pulvinar nulla. Vivamus a gravida mauris, sed cursus risus."
  }
];

const FabricProtection = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollToHash = () => {
      if (location.hash) {
        const targetId = location.hash.replace("#", "");
        const element = document.getElementById(targetId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    scrollToHash();
  }, [location.hash]);

  return (
    <div className="bg-[#FAF6F2] min-h-screen font-sweet-sans">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f9ede5] via-[#fef8f5] to-[#f4e6dc] opacity-90" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-16 h-32 w-32 border border-luxury-gold/20 rotate-12" />
          <div className="absolute bottom-12 right-10 h-40 w-40 border border-luxury-gold/20 -rotate-6" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-10 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24 text-center text-gray-900">
          <p className="uppercase tracking-[0.45em] text-[10px] sm:text-xs text-luxury-gold mb-4">The Yobha Ritual</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-tight font-light uppercase mb-5">Fabric Protection Lab</h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide">
            Discover the invisible craftsmanship behind every indulgent layer. Our advanced treatments preserve the elegance of silk while adding a quiet assurance of purity.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            {sectionData.map((section) => (
              <Link
                key={section.id}
                to={`#${section.id}`}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-luxury-gold/60 rounded-full text-xs sm:text-sm tracking-[0.35em] uppercase text-gray-900 bg-white/70 hover:bg-white transition-all duration-300"
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {sectionData.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`relative ${index % 2 === 0 ? "bg-white" : "bg-[#fdf7f2]"} py-16 sm:py-20 md:py-24`}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-12 h-20 w-20 border border-luxury-gold/20 rotate-45" />
            <div className="absolute bottom-10 right-12 h-24 w-24 border border-luxury-gold/20 -rotate-12" />
          </div>

          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 sm:px-10 md:px-12 lg:px-16 lg:flex-row lg:items-start">
            <div className="lg:w-5/12">
              <span className="uppercase tracking-[0.4em] text-[10px] sm:text-xs text-luxury-gold">Signature Process</span>
              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-light uppercase text-gray-900 leading-snug">
                {section.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide">
                {section.subtitle}
              </p>

              <div className="mt-8 space-y-4">
                {section.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-luxury-gold/40 text-[11px] text-luxury-gold">•</span>
                    <p className="text-sm sm:text-base text-gray-700 font-light tracking-wide leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-7/12">
              <div className="rounded-[2.75rem] sm:rounded-[3rem] border border-gray-200/60 bg-white/80 p-6 sm:p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur">
                <div className="h-1 w-20 bg-gradient-to-r from-luxury-gold via-amber-300 to-luxury-gold/80"></div>
                <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide leading-relaxed">
                  {section.description}
                </p>
                <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide leading-relaxed">
                  {section.content}
                </p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((slot) => (
                    <div
                      key={`${section.id}-card-${slot}`}
                      className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Material Insight</p>
                      <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
                        Placeholder copy for key benefit #{slot}. Curate a concise note here describing how this treatment elevates everyday comfort while preserving couture standards.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-[#f9ede5] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-12 lg:px-16 text-center">
          <p className="uppercase tracking-[0.4em] text-[10px] sm:text-xs text-luxury-gold">Care Philosophy</p>
          <h3 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-light uppercase text-gray-900">Crafted For Conscious Luxury</h3>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-600 font-light tracking-wide leading-relaxed">
            Each finish is meticulously tested to harmonise science with comfort, ensuring every piece you embrace embodies the poise and purity of the YOBHA universe.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FabricProtection;

