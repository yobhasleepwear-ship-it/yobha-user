import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MEN_IMAGE from "../../assets/Men.png";
import WOMEN_IMAGE from "../../assets/Women.png";
import KID_IMAGE from "../../assets/kids-hero.jpg";
import PET_IMAGE from "../../assets/pet-hero.jpg";
import COUPLE_IMAGE from "../../assets/couple-hero1.jpg";
import FAMILY_IMAGE from "../../assets/family-hero.jpg";
import SCRUNCHIES from "../../assets/SCRUNCHIES.jpg";
import Socks from "../../assets/SOCKS.jpg";
import headband from "../../assets/HEADBAND.jpg";
import eyemask from "../../assets/EYEMASKS.jpg";
import cushions from "../../assets/CUSHIONS.jpg";
import BATHROBE_IMAGE from "../../assets/bathrobe.jpg";
import TOWELS_IMAGE from "../../assets/towel.jpg";
import { getFilteredProducts } from "../../service/productAPI";

const HomePage2 = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(false);
  const [recentVisited, setRecentVisited] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  // Video URLs
  const portraitVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";
  const landscapeVideo = "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4";

  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth ||
        (window.innerWidth < 768 && window.innerHeight > window.innerWidth);
      setIsPortrait(isPortraitMode);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("recentVisited");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const seen = new Set();
          const unique = [];
          for (let i = parsed.length - 1; i >= 0; i -= 1) {
            const item = parsed[i];
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              unique.unshift(item);
            }
          }
          setRecentVisited(unique.slice(-6));
        }
      } catch (err) {
        console.error("Error parsing recentVisited:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const payload = {
        q: "",
        category: "",
        subCategory: "",
        minPrice: null,
        maxPrice: null,
        pageNumber: null,
        pageSize: 12,
        sort: "latest",
        country: null,
      };
      const response = await getFilteredProducts(payload);
      if (response && response.success && response.data) {
        setProducts(response.data.items || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const genderCategories = [
    { id: "Women", title: "Women", image: WOMEN_IMAGE },
    { id: "men", title: "Men", image: MEN_IMAGE },
    { id: "kids", title: "Kids", image: KID_IMAGE },
    { id: "pets", title: "Pets", image: PET_IMAGE },
    { id: "couple", title: "Couple", image: COUPLE_IMAGE },
    { id: "family", title: "Family", image: FAMILY_IMAGE },
  ];

  const accessoriesCategories = [
    { id: "scrunchies", title: "Scrunchies", image: SCRUNCHIES },
    { id: "socks", title: "Socks", image: Socks },
    { id: "eyemasks", title: "Eye Masks", image: eyemask },
    { id: "headband", title: "Headbands", image: headband },
    { id: "cushions", title: "Cushions", image: cushions },
    { id: "bathrobe", title: "Bathrobe", image: BATHROBE_IMAGE },
    { id: "towels", title: "Towels", image: TOWELS_IMAGE },
  ];

  const displayProducts = products
    .filter((p) => p.available)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      title: p.name || "Untitled Product",
      price: p.price ? `₹${p.price.toLocaleString("en-IN")}` : "Price not available",
      image: p.images?.[0] || "",
      badge: p.productMainCategory || "New",
      slug: p.productId,
      category: p.category || "Luxury Collection"
    }));

  return (
    <div className="relative min-h-screen bg-[#FAF6F2]">
      {/* Hero Section with Banner and Video - Two Parts with Equal Height */}
      <section className="relative w-full">
        {/* Sale Banner Image - Part 1 */}
        <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-luxury-gold/80 to-luxury-rose-gold/80 flex items-center justify-center">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl uppercase tracking-[0.15em] md:tracking-[0.2em] text-white font-light text-center px-4">
              Limited Time Offer: Free Shipping on Orders Above ₹2000
            </p>
          </div>
        </div>

        {/* Video Section - Part 2 */}
        <div className="relative h-[40vh] md:h-screen w-full overflow-hidden">
          <video
            src={isPortrait ? portraitVideo : landscapeVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            key={isPortrait ? 'portrait' : 'landscape'}
          />
        </div>
      </section>

      {/* Buyback USP Section */}
      <section className="relative w-full bg-white font-sweet-sans">
        {/* Mobile: Image with Overlaid Text */}
        <div className="md:hidden relative h-[450px] cursor-pointer group overflow-hidden"
          onClick={() => navigate('/buyback')}>
          {/* Image Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Placeholder for image - you can replace this with an actual buyback image */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Buyback Image</p>
              </div>
            </div>
          </div>
          
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          {/* Overlaid Text and Button */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8">
            <div className="max-w-sm">
              <h2 className="text-white font-light">
                <span className="text-3xl sm:text-4xl block mb-1 tracking-wide">Trade in.</span>
                <span className="text-4xl sm:text-5xl block tracking-wide">Get Credit.</span>
              </h2>
              <p className="mt-4 text-white/90 text-sm font-light tracking-wide leading-relaxed">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative.
              </p>
              <button className="mt-6 px-8 py-3 bg-white border border-gray-900 text-gray-900 text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Split Layout */}
        <div className="hidden md:grid md:grid-cols-2 min-h-[500px] lg:min-h-[600px] cursor-pointer group"
          onClick={() => navigate('/buyback')}>
          {/* Text Section - Dark Background */}
          <div className="relative bg-gray-900 flex flex-col justify-center px-12 lg:px-16 py-16">
            <div className="max-w-xl">
              <h2 className="text-white font-light">
                <span className="text-4xl md:text-5xl lg:text-6xl block mb-2 tracking-wide">Trade in.</span>
                <span className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl block tracking-wide">Get Credit.</span>
              </h2>
              <p className="mt-8 text-white/90 text-base md:text-lg font-light tracking-wide leading-relaxed max-w-md">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative and give your luxury wardrobe a new life.
              </p>
              <button className="mt-10 px-10 py-3.5 bg-white border border-gray-900 text-gray-900 text-sm uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="relative h-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:opacity-95 transition-opacity duration-500">
              {/* Placeholder for image - you can replace this with an actual buyback image */}
              <div className="w-full h-full flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
                <div className="text-center p-8">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-16 h-16 lg:w-20 lg:h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Buyback Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Microbial Highlight Section */}
      {/* <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-[#FAF6F2]">
        <div className="max-w-7xl mx-auto">
          <div className="border border-gray-200 bg-white overflow-hidden cursor-pointer group"
            onClick={() => navigate('/fabric-protection#anti-microbial')}>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-8 md:p-12">
              <div className="order-2 md:order-1">
                <div className="relative h-[300px] md:h-[400px] bg-gray-100 group-hover:opacity-90 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-luxury-rose-gold/20 via-transparent to-purple-200/20" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-xs uppercase tracking-[0.4em] text-luxury-gold font-light">Premium Protection</span>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 uppercase tracking-widest">
                  Anti-Microbial Assurance
                </h2>
                <p className="mt-6 text-base md:text-lg text-gray-600 font-light tracking-wide leading-relaxed">
                  Lab-tested finish that actively diminishes microbial growth. Freshness curated for everyday rituals with breathable, hypoallergenic treatment.
                </p>
                <button className="mt-8 px-8 py-4 border-2 border-gray-900 text-gray-900 text-sm uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500">
                  Discover More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Gender Grid Section with Text Outside */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-white font-sweet-sans">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 uppercase tracking-widest mb-4">
              Indulge in Luxury
            </h2>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-3xl mx-auto font-light tracking-wide leading-relaxed">
              Discover timeless elegance across our curated collections
            </p>
          </div>

          {/* Gender Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 md:gap-10 mb-20">
            {genderCategories.map((category, index) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/products/${category.id}`)}
              >
                <div className="relative h-[240px] md:h-[360px] lg:h-[400px] overflow-hidden bg-gray-50 border border-gray-200/50 group-hover:border-gray-300/70 transition-all duration-500">
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/0 via-white/0 to-black/5 group-hover:from-white/0 group-hover:via-white/0 group-hover:to-black/10 transition-all duration-700" />
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Subtle overlay text on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <div className="h-px w-0 group-hover:w-full bg-white/40 transition-all duration-700 delay-100 mb-3" />
                    <p className="text-white text-xs uppercase tracking-[0.3em] font-light">
                      Explore Collection
                    </p>
                  </div>
                </div>
                <div className="mt-6 md:mt-7 text-center">
                  <h3 className="text-base md:text-lg font-light text-gray-900 uppercase tracking-[0.15em] group-hover:text-gray-800 transition-all duration-300">
                    {category.title}
                  </h3>
                  <div className="mt-2 h-px w-0 mx-auto bg-gray-300 group-hover:w-12 transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Accessories Section Within Gender Grid - No Separate Heading */}
          <div className="mt-24 md:mt-28">
            {/* Subtle divider */}
            <div className="flex items-center justify-center mb-12 md:mb-16">
              <div className="h-px w-24 bg-gray-200" />
              <div className="mx-4 w-1 h-1 rounded-full bg-gray-300" />
              <div className="h-px w-24 bg-gray-200" />
            </div>
            
            {/* Auto-scrolling Carousel Container */}
            <div className="relative overflow-hidden w-full">
              {/* Gradient overlays for fade effect on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              
              {/* Scrolling container */}
              <div className="flex gap-5 md:gap-6 carousel-auto-scroll">
                {/* First set of items */}
                {accessoriesCategories.map((accessory, index) => (
                  <div
                    key={`accessory-1-${accessory.id}`}
                    className="group cursor-pointer flex-shrink-0"
                    style={{ width: 'calc(50vw - 40px)', minWidth: '160px', maxWidth: '280px' }}
                    onClick={() => navigate(`/products/${accessory.id.toLowerCase()}`)}
                  >
                    <div className="relative h-[200px] md:h-[260px] lg:h-[280px] overflow-hidden bg-gray-50 border border-gray-200/50 group-hover:border-gray-300/70 transition-all duration-500">
                      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/0 via-white/0 to-black/5 group-hover:from-white/0 group-hover:via-white/0 group-hover:to-black/10 transition-all duration-700" />
                      <img
                        src={accessory.image}
                        alt={accessory.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Subtle overlay text on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                        <div className="h-px w-0 group-hover:w-full bg-white/40 transition-all duration-700 delay-100 mb-2" />
                        <p className="text-white text-[10px] md:text-xs uppercase tracking-[0.25em] font-light">
                          View
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 md:mt-6 text-center">
                      <h4 className="text-base md:text-lg font-light text-gray-900 uppercase tracking-[0.15em] group-hover:text-gray-800 transition-all duration-300">
                        {accessory.title}
                      </h4>
                      <div className="mt-2 h-px w-0 mx-auto bg-gray-300 group-hover:w-10 transition-all duration-500" />
                    </div>
                  </div>
                ))}
                
                {/* Duplicate set for seamless loop */}
                {accessoriesCategories.map((accessory, index) => (
                  <div
                    key={`accessory-2-${accessory.id}`}
                    className="group cursor-pointer flex-shrink-0"
                    style={{ width: 'calc(50vw - 40px)', minWidth: '160px', maxWidth: '280px' }}
                    onClick={() => navigate(`/products/${accessory.id.toLowerCase()}`)}
                  >
                    <div className="relative h-[200px] md:h-[260px] lg:h-[280px] overflow-hidden bg-gray-50 border border-gray-200/50 group-hover:border-gray-300/70 transition-all duration-500">
                      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/0 via-white/0 to-black/5 group-hover:from-white/0 group-hover:via-white/0 group-hover:to-black/10 transition-all duration-700" />
                      <img
                        src={accessory.image}
                        alt={accessory.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.08] group-hover:brightness-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Subtle overlay text on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                        <div className="h-px w-0 group-hover:w-full bg-white/40 transition-all duration-700 delay-100 mb-2" />
                        <p className="text-white text-[10px] md:text-xs uppercase tracking-[0.25em] font-light">
                          View
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 md:mt-6 text-center">
                      <h4 className="text-base md:text-lg font-light text-gray-900 uppercase tracking-[0.15em] group-hover:text-gray-800 transition-all duration-300">
                        {accessory.title}
                      </h4>
                      <div className="mt-2 h-px w-0 mx-auto bg-gray-300 group-hover:w-10 transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending New Arrivals */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-[#FAF6F2] font-sweet-sans">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 uppercase tracking-widest mb-4">
              New Arrivals
            </h2>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
              Discover our latest collection of premium essentials
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-luxury-gold/20 animate-spin" />
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <article
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/productDetail/${product.id}`)}
                >
                  <div className="relative h-[250px] md:h-[350px] overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm md:text-base font-light text-gray-900 uppercase tracking-wide line-clamp-2 min-h-[2.5rem] group-hover:text-luxury-gold transition-colors duration-300">
                      {product.title}
                    </h3>
                    {product.badge && (
                      <span className="inline-block text-xs uppercase tracking-widest text-luxury-gold">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
            </div>
          )}

          {displayProducts.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-sm uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500"
              >
                View All Products →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentVisited.length > 0 && (
        <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-white font-sweet-sans">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 uppercase tracking-widest mb-4">
                Recently Viewed
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto font-light tracking-wide">
                Revisit the pieces that caught your eye
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentVisited.map((item) => (
                <article
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/productDetail/${item.id}`)}
                >
                  <div className="relative h-[200px] md:h-[250px] overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-light text-gray-900 uppercase tracking-wide line-clamp-1 group-hover:text-luxury-gold transition-colors duration-300">
                      {item.name}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Follow Us on Instagram Section */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-white font-sweet-sans">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 uppercase tracking-widest mb-4">
            Follow Us
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto font-light tracking-wide mb-8">
            Join our community on Instagram for the latest updates and exclusive content
          </p>
          
          <div className="flex justify-center items-center mt-12">
            <a
              href="https://www.instagram.com/yobha.world"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 border-2 border-gray-900 hover:bg-gray-900 transition-all duration-500">
                <svg className="w-10 h-10 md:w-12 md:h-12 fill-current text-gray-900 group-hover:text-white" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeLinecap="round"/>
                </svg>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage2;

