import React, { useState, useEffect, useRef } from "react";
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
import SALE_BANNER_IMAGE from "../../assets/sale-banner.jpg";
import BUYBACK_IMAGE from "../../assets/buyback-image.jpg";
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
      images: p.images || [],
      badge: p.productMainCategory || "New",
      slug: p.productId,
      category: p.category || "Luxury Collection"
    }));

  // Image carousel state for each product
  const [productImageIndices, setProductImageIndices] = useState({});
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Auto-rotate images for each product
  useEffect(() => {
    if (displayProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setProductImageIndices(prev => {
        const newIndices = { ...prev };
        displayProducts.forEach(product => {
          if (product.images && product.images.length > 1) {
            const currentIndex = prev[product.id] || 0;
            newIndices[product.id] = (currentIndex + 1) % product.images.length;
          }
        });
        return newIndices;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [displayProducts]);

  // Initialize image indices
  useEffect(() => {
    if (displayProducts.length > 0) {
      const initialIndices = {};
      displayProducts.forEach(product => {
        initialIndices[product.id] = 0;
      });
      setProductImageIndices(initialIndices);
    }
  }, [displayProducts]);

  // Handle drag to scroll
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !carouselRef.current) return;
      e.preventDefault();
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset interaction state after 5 seconds
      setTimeout(() => setIsUserInteracting(false), 5000);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsUserInteracting(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6F2]">
      {/* Hero Section with Banner and Video - Two Parts with Equal Height */}
      <section className="relative w-full">
        {/* Mobile: Stacked Layout - Banner above, Video below */}
        {/* Desktop/Laptop: 2 Column Grid - Banner left, Video right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 px-0 lg:px-8">
          {/* Sale Banner - Left on desktop, Top on mobile */}
          <div className="relative w-full h-[30vh] md:h-[35vh] lg:h-[500px] overflow-hidden group cursor-pointer lg:shadow-2xl lg:border-r-4 lg:border-luxury-gold/30">
            {/* Background Image */}
            <img 
              src={SALE_BANNER_IMAGE} 
              alt="Sale Banner" 
              className="w-full h-full object-contain md:object-cover lg:object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Decorative Border Effect on Hover */}
            <div className="absolute inset-0 border-4 border-luxury-gold/0 group-hover:border-luxury-gold/50 transition-all duration-500" />
            {/* Subtle Corner Accent */}
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-luxury-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-luxury-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

          {/* Video Section - Right on desktop, Bottom on mobile */}
          <div className="relative w-full h-[30vh] md:h-[35vh] lg:h-[500px] overflow-hidden group cursor-pointer lg:shadow-2xl lg:border-l-4 lg:border-gray-900/20 mt-4 lg:mt-0">
          <video
            src={isPortrait ? portraitVideo : landscapeVideo}
            autoPlay
            loop
            muted
            playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            key={isPortrait ? 'portrait' : 'landscape'}
          />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tl from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Decorative Border Effect on Hover */}
            <div className="absolute inset-0 border-4 border-gray-900/0 group-hover:border-gray-900/30 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* Buyback USP Section */}
      <section className="relative w-full bg-white font-sweet-sans py-8 md:py-12 lg:py-16">
        {/* Mobile: Image with Overlaid Text */}
        <div className="md:hidden relative h-[450px] cursor-pointer group overflow-hidden"
          onClick={() => navigate('/buyback')}>
          {/* Image Background */}
          <img 
            src={BUYBACK_IMAGE} 
            alt="Buyback" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          {/* Overlaid Text and Button */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8">
            <div className="max-w-sm font-sweet-sans">
              <h2 className="text-white font-light font-sweet-sans">
                <span className="text-3xl sm:text-4xl block mb-1 tracking-wide font-sweet-sans">Trade in.</span>
                <span className="text-4xl sm:text-5xl block tracking-wide font-sweet-sans">Get Credit.</span>
              </h2>
              <p className="mt-4 text-white/90 text-sm font-light tracking-wide leading-relaxed font-sweet-sans">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative.
              </p>
              <button className="mt-6 px-8 py-3 bg-white border border-gray-900 text-gray-900 text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full font-sweet-sans">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Split Layout */}
        <div className="hidden md:grid md:grid-cols-2 min-h-[500px] lg:min-h-[600px] cursor-pointer group"
          onClick={() => navigate('/buyback')}>
          {/* Text Section - Dark Background */}
          <div className="relative bg-gray-900 flex flex-col justify-center px-12 lg:px-16 py-16 font-sweet-sans">
            <div className="max-w-xl font-sweet-sans">
              <h2 className="text-white font-light font-sweet-sans">
                <span className="text-4xl md:text-5xl lg:text-6xl block mb-2 tracking-wide font-sweet-sans">Trade in.</span>
                <span className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl block tracking-wide font-sweet-sans">Get Credit.</span>
              </h2>
              <p className="mt-8 text-white/90 text-base md:text-lg font-light tracking-wide leading-relaxed max-w-md font-sweet-sans">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative and give your luxury wardrobe a new life.
              </p>
              <button className="mt-10 px-10 py-3.5 bg-white border border-gray-900 text-gray-900 text-sm uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full font-sweet-sans">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="relative h-auto overflow-hidden">
            <img 
              src={BUYBACK_IMAGE} 
              alt="Buyback" 
              className="w-full h-full object-cover min-h-[500px] lg:min-h-[600px] group-hover:scale-105 transition-transform duration-700"
            />
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
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20 lg:py-24 bg-white font-sweet-sans">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8">
              Indulge in Luxury
            </h2>
            <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-6 md:mb-8" />
            <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
              Discover timeless elegance across our curated collections
            </p>
          </div>

          {/* Gender Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 mb-16 md:mb-20">
            {genderCategories.map((category, index) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/products/${category.id}`)}
              >
                <div className="relative h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px] xl:h-[480px] overflow-hidden bg-gray-50/50 border border-gray-100 group-hover:border-gray-200 transition-all duration-700 ease-out">
                  {/* Subtle shadow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]" />
                  </div>
                  
                  {/* Refined gradient overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/5 via-transparent to-black/5 group-hover:from-white/10 group-hover:via-transparent group-hover:to-black/10 transition-all duration-700" />
                  
                  <img
                    src={category.image}
                    alt={category.title}
                    className={`h-full w-full object-cover transition-all duration-[1000ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.03] ${
                      category.id === "couple" ? "object-[center_top]" : ""
                    }`}
                    style={category.id === "couple" ? { objectPosition: "center top" } : {}}
                  />
                  
                  {/* Elegant gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Text Outside - Enhanced Typography */}
                <div className="mt-6 md:mt-8 lg:mt-10 text-center">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-gray-900 uppercase tracking-[0.2em] md:tracking-[0.25em] group-hover:text-gray-700 transition-colors duration-500">
                    {category.title}
                  </h3>
                  {/* Minimal decorative line */}
                  <div className="mt-3 md:mt-4 h-[1px] w-0 mx-auto bg-gray-400 group-hover:w-10 md:group-hover:w-12 transition-all duration-700 ease-out" />
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
            <div className="relative overflow-hidden">
              {/* Carousel Container - Scrollable */}
              <div 
                ref={carouselRef}
                className={`flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-2 ${!isUserInteracting ? 'new-arrivals-carousel' : ''}`}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => setIsUserInteracting(true)}
                onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 5000)}
                onWheel={() => setIsUserInteracting(true)}
              >
                {/* First set of products */}
              {displayProducts.map((product) => (
                <article
                    key={`product-1-${product.id}`}
                    className="group cursor-pointer flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                  onClick={() => navigate(`/productDetail/${product.id}`)}
                >
                    <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden bg-white border border-gray-200/30 shadow-sm group-hover:shadow-2xl group-hover:border-gray-300/50 transition-all duration-700">
                      {/* Product Image Carousel */}
                      <div className="relative w-full h-full">
                        {product.images && product.images.length > 0 ? (
                          product.images.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt={`${product.title} - ${imgIndex + 1}`}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                productImageIndices[product.id] === imgIndex ? 'opacity-100' : 'opacity-0'
                              } group-hover:scale-110 transition-transform duration-700`}
                            />
                          ))
                        ) : (
                    <img
                      src={product.image}
                      alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        
                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Badge */}
                      {product.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200/50">
                          <span className="text-xs uppercase tracking-[0.2em] text-gray-900 font-light">
                            {product.badge}
                          </span>
                        </div>
                      )}
                  </div>
                    
                    {/* Product Info */}
                  <div className="mt-4 space-y-2">
                      <h3 className="text-sm md:text-base font-light text-gray-900 uppercase tracking-wide line-clamp-2 min-h-[2.5rem] group-hover:text-luxury-gold transition-colors duration-300 font-sweet-sans">
                      {product.title}
                    </h3>
                    </div>
                  </article>
                ))}
                
                {/* Duplicate set for seamless loop */}
                {displayProducts.map((product) => (
                  <article
                    key={`product-2-${product.id}`}
                    className="group cursor-pointer flex-shrink-0 w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                    onClick={() => navigate(`/productDetail/${product.id}`)}
                  >
                    <div className="relative h-[280px] md:h-[380px] lg:h-[420px] overflow-hidden bg-white border border-gray-200/30 shadow-sm group-hover:shadow-2xl group-hover:border-gray-300/50 transition-all duration-700">
                      {/* Product Image Carousel */}
                      <div className="relative w-full h-full">
                        {product.images && product.images.length > 0 ? (
                          product.images.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt={`${product.title} - ${imgIndex + 1}`}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                productImageIndices[product.id] === imgIndex ? 'opacity-100' : 'opacity-0'
                              } group-hover:scale-110 transition-transform duration-700`}
                            />
                          ))
                        ) : (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        
                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* Badge */}
                    {product.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200/50">
                          <span className="text-xs uppercase tracking-[0.2em] text-gray-900 font-light">
                        {product.badge}
                      </span>
                        </div>
                    )}
                  </div>
                    
                    {/* Product Info */}
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm md:text-base font-light text-gray-900 uppercase tracking-wide line-clamp-2 min-h-[2.5rem] group-hover:text-luxury-gold transition-colors duration-300 font-sweet-sans">
                        {product.title}
                      </h3>
                  </div>
                </article>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
            </div>
          )}

          {displayProducts.length > 0 && (
            <div className="text-center mt-12 md:mt-16">
              <button
                onClick={() => navigate('/products', { state: { sortBy: 'latest' } })}
                className="px-10 py-3.5 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.25em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-500 bg-transparent font-sweet-sans"
              >
                View All New Arrivals →
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

