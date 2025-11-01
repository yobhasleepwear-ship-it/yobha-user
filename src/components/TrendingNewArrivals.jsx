import React, { useMemo, useRef, useState, useLayoutEffect } from "react";


const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: "Silk Night Shirt",
    description: "Hand-finished mulberry silk with mother-of-pearl buttons",
    price: "₹4,990",
    image: "https://i.etsystatic.com/19870219/r/il/9939a4/3877887290/il_fullxfull.3877887290_o82x.jpg",
    badge: "New",
  },
  {
    id: 2,
    title: "Cashmere Lounge Set",
    description: "Featherlight knit with breathable comfort",
    price: "₹6,450",
    image: "https://i.ebayimg.com/images/g/F8gAAOSw5RldMuSB/s-l400.jpg",
    badge: "Trending",
  },
  {
    id: 3,
    title: "Satin Camisole",
    description: "Lustrous drape with adjustable straps",
    price: "₹2,490",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlDdRDL3DAbUYYbvbijqJDG6btkfNZYECbz2IG3Y1hCknNZrt01pYWKCofaaUiCX-DVKM&usqp=CAU",
    badge: "Bestseller",
  },
  {
    id: 4,
    title: "Velour Robe",
    description: "Ultra-plush warmth, hotel-grade finish",
    price: "₹5,290",
    image: "https://i.pinimg.com/236x/7e/6d/a5/7e6da53be4b66e464fd76766878c9b7c.jpg",
    badge: "New",
  },
];

const TrendingNewArrivals = () => {
  const [index, setIndex] = useState(0);
  // visibleCount adapts to screen size: 1 on mobile, 3 on md and up (tailwind default md = 768px)
  const [visibleCount, setVisibleCount] = useState(() => (typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1));

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handle = (e) => setVisibleCount(e.matches ? 3 : 1);
    // call initially
    handle(mq);
    // add listener (support both modern and older APIs)
    if (mq.addEventListener) mq.addEventListener("change", handle);
    else mq.addListener(handle);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handle);
      else mq.removeListener(handle);
    };
  }, []);

  const maxIndex = Math.max(0, SAMPLE_PRODUCTS.length - visibleCount);
  const clampedIndex = useMemo(() => Math.max(0, Math.min(index, maxIndex)), [index, maxIndex]);
  const trackRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [gapPx, setGapPx] = useState(0);

  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // Measure the first card width and the grid gap so we can translate in px
  useLayoutEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      const first = trackRef.current.querySelector("article");
      if (!first) {
        setCardWidth(0);
        setGapPx(0);
        return;
      }
      const rect = first.getBoundingClientRect();
      const w = Math.round(rect.width);
      const cs = window.getComputedStyle(trackRef.current);
      // columnGap is used for grid layouts; fallback to gap
      const gapStr = cs.columnGap || cs.gap || "0px";
      const gap = Math.round(parseFloat(gapStr) || 0);
      setCardWidth(w);
      setGapPx(gap);
    };

    // measure after a microtask to allow layout to settle
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visibleCount]);

  return (
  <section className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 bg-[#FAF6F2]">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#e7bfb3] via-[#f6d6cb] to-[#d9a79a]">Trending Collections</h2>
          <p className="text-neutral-600 text-sm md:text-base mt-1">New Arrivals crafted for elevated lounging</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button onClick={prev} aria-label="Previous" className="h-10 w-10 rounded-full border border-[#e7bfb3]/40 text-neutral-700 hover:text-black hover:border-[#e7bfb3]/70 transition">‹</button>
          <button onClick={next} aria-label="Next" className="h-10 w-10 rounded-full border border-[#e7bfb3]/40 text-neutral-700 hover:text-black hover:border-[#e7bfb3]/70 transition">›</button>
        </div>
      </div>

      <div className="relative mt-6">


        {/* Mobile arrows inside track edges */}
        <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10">
          <button onClick={prev} aria-label="Previous" className="h-9 w-9 rounded-full border border-[#e7bfb3]/40 bg-white/90 text-neutral-700">‹</button>
          <button onClick={next} aria-label="Next" className="h-9 w-9 rounded-full border border-[#e7bfb3]/40 bg-white/90 text-neutral-700">›</button>
        </div>

        <div className="overflow-hidden md:px-4">
          <div
            ref={trackRef}
            className="grid grid-flow-col auto-cols-[100%] sm:auto-cols-[85%] md:auto-cols-[calc((100%-40px)/3)] bg-[#FAF6F2] gap-5 transition-transform duration-500"
            style={{ transform: cardWidth ? `translateX(-${clampedIndex * (cardWidth + gapPx)}px)` : `translateX(-${clampedIndex * (100 / visibleCount)}%)` }}
          >
            {SAMPLE_PRODUCTS.map((p) => (
              <article 
                key={p.id} 
                className="group bg-white border border-[#e7bfb3]/30 rounded-2xl overflow-hidden shadow-[0_6px_26px_rgba(15,15,15,0.06)] flex flex-col h-full cursor-pointer hover:border-[#e7bfb3]/50 transition-all duration-300"
                onClick={() => {
                  // Navigate to product detail page
                  console.log(`Clicked product: ${p.id}`);
                  // You can add navigation here: navigate(`/product/${p.id}`)
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  {p.badge && (
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-[#f6d6cb] text-black font-medium">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[#8b5f4b] font-semibold">{p.title}</h3>
                  <p className="text-black text-sm mt-1 line-clamp-2 flex-1">{p.description}</p>
                  <div className="mt-3">
                    <span className="text-[#8b5f4b] font-semibold">{p.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingNewArrivals;


