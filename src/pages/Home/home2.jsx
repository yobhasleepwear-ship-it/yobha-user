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
import BUYBACK_IMAGE from "../../assets/buyback-image.jpg";
import { getFilteredProducts } from "../../service/productAPI";
import { SubscribeNewsletter } from "../../service/notification";
import { message } from "../../comman/toster-message/ToastContainer";
import ProductCard from "../product/components/product-card";

const HomePage2 = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(false);
  const [recentVisited, setRecentVisited] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const accessoriesRef = useRef(null);
  const [isAccDragging, setIsAccDragging] = useState(false);
  const [accStartX, setAccStartX] = useState(0);
  const [accScrollLeft, setAccScrollLeft] = useState(0);
  const [isAccUserInteracting, setIsAccUserInteracting] = useState(false);
  const [isAccHovered, setIsAccHovered] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const giftShopRef = useRef(null);

  // Video URLs - Add your manufacturing/packaging video URLs here
  const manufacturingVideos = [
    {
      id: 1,
      portrait: "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4",
      landscape: "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4",

    },
    {
      id: 2,
      portrait: "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4",
      landscape: "https://firebasestorage.googleapis.com/v0/b/yobhasleepwear-5ae76.firebasestorage.app/o/Hero-Video%2Fhero-vid.mp4?alt=media&token=40901bd4-7ba6-4565-9e07-85b853223ea4",

    }
    // Add more videos here as needed
    // {
    //   id: 2,
    //   portrait: "your-video-url-2.mp4",
    //   landscape: "your-video-url-2.mp4",
    //   title: "Packaging Process"
    // },
  ];

  // Hero Video URLs (for hero section)
  const portraitVideo = "https://vod.freecaster.com/louisvuitton/a04723c9-c426-48c6-9e45-b3cc5fecceba/yRedHpMc1t34Pr5gScX3GF4J_3.mp4";
  const landscapeVideo = "https://vod.freecaster.com/louisvuitton/a04723ab-0c87-48cd-9a64-130562635d71/NEdEFmAPqMS9gxd4rFYAQRDw_11.mp4";

  useEffect(() => {
    fetchProducts();
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
    { id: "Women", title: "WOMEN", image: WOMEN_IMAGE },
    { id: "men", title: "MEN", image: MEN_IMAGE },
    { id: "kids", title: "Kids", image: KID_IMAGE },
    { id: "pets", title: "Pets", image: PET_IMAGE },
    { id: "couple", title: "Couple", image: COUPLE_IMAGE },
    { id: "family", title: "Family", image: FAMILY_IMAGE },
    { id: "accessories", title: "Accessories", image: SCRUNCHIES },
    { id: "others", title: "Others", image: cushions },
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


  // Image carousel state for each product

  useEffect(() => {
    if (isAccUserInteracting && accessoriesRef.current) {
      const handleMouseMove = (e) => {
        if (!accessoriesRef.current) return;
        const currentX = e.pageX - accessoriesRef.current.offsetLeft;
        const diffX = currentX - accStartX;
        accessoriesRef.current.scrollLeft = accScrollLeft - diffX;
      };

      const handleMouseUp = () => {
        setIsAccDragging(false);
        setIsAccUserInteracting(false);
      };

      const handleTouchMove = (e) => {
        if (!accessoriesRef.current) return;
        const currentX = e.touches[0].pageX - accessoriesRef.current.offsetLeft;
        const diffX = currentX - accStartX;
        accessoriesRef.current.scrollLeft = accScrollLeft - diffX;
      };

      const handleTouchEnd = () => {
        setIsAccDragging(false);
        setIsAccUserInteracting(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isAccUserInteracting, accStartX, accScrollLeft]);

  const handleAccMouseDown = (e) => {
    if (!accessoriesRef.current) return;
    setIsAccDragging(true);
    setIsAccUserInteracting(true);
    setAccStartX(e.pageX - accessoriesRef.current.offsetLeft);
    setAccScrollLeft(accessoriesRef.current.scrollLeft);
    e.preventDefault();
  };

  const handleAccPrev = (e) => {
    e.stopPropagation();
    if (!accessoriesRef.current) return;
    setIsAccUserInteracting(true);
    const scrollAmount = accessoriesRef.current.clientWidth * 0.6;
    accessoriesRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(() => setIsAccUserInteracting(false), 4000);
  };

  const handleAccNext = (e) => {
    e.stopPropagation();
    if (!accessoriesRef.current) return;
    setIsAccUserInteracting(true);
    const scrollAmount = accessoriesRef.current.clientWidth * 0.6;
    accessoriesRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(() => setIsAccUserInteracting(false), 4000);
  };

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail || !newsletterEmail.trim()) {
      message.error("Please enter a valid email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      message.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    try {
      const payload = {
        email: newsletterEmail.trim(),
        countryCode: "",
        phoneNumber: ""
      };
      await SubscribeNewsletter(payload);
      message.success("Subscribed successfully!");
      setNewsletterEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      message.error("Something went wrong. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6F2]">
      {/* Hero Section - Full Width Video */}
      <section className="relative w-full">
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] lg:h-[640px] overflow-hidden">
          <video
            src={isPortrait ? portraitVideo : landscapeVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
            key={isPortrait ? "portrait" : "landscape"}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/30 pointer-events-none" />

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <button
              onClick={() => {
                // if (giftShopRef.current) {
                //   giftShopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                // }
                navigate("/giftCard-Personalization")
              }}
              className="px-8 py-3 bg-black text-white text-sm sm:text-base md:text-lg font-light rounded-full uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 shadow-[0_8px_30px_rgba(17,17,26,0.1)]"
            >
              Gifts
            </button>
          </div>
        </div>
      </section>
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12 bg-white font-sweet-sans">
        <div className=" mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-3 font-futura-pt-light">
              Curated By YOBHA
            </h2>
            <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed">
              New Winter Collection
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-luxury-gold/20 animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" style={{ gap: '0.75rem' }}>
                {products
                  .filter((p) => p.available)
                  .slice(0, 8)
                  .map((product, index) => {
                  const hideOnMobile = index >= 6;
                  return (
                    <div key={product.id} className={hideOnMobile ? "hidden md:block" : "block"}>
                        <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate("/products")}
                  className="px-10 py-3 bg-black text-white text-sm md:text-base uppercase tracking-[0.3em] rounded-full hover:bg-gray-900 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.12)] font-light font-futura-pt-light"
                >
                  Explore All
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm md:text-base">New arrivals are coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* Buyback USP Section */}
      <section className="relative w-full bg-white font-futura py-6 md:py-8 lg:py-10">
        <div className="md:hidden relative h-[450px] cursor-pointer group overflow-hidden"
          onClick={() => navigate('/buyback')}>
          {/* Image Background */}
          <img
            src={BUYBACK_IMAGE}
            alt="Buyback"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          {/* Overlaid Text and Button */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8">
            <div className="max-w-sm font-futura">
              <h2 className="text-white font-light font-futura-pt-light">
                <span className="text-2xl sm:text-2xl block mb-1 font-light font-futura-pt-light">Recycle</span>
                <span className="text-2xl sm:text-2xl block font-light font-futura-pt-light">Renew</span>
                <span className="text-2xl sm:text-2xl block mt-1 font-light font-futura-pt-light">Reuse</span>
              </h2>
              <p className="mt-3 text-white/90 text-xs font-light leading-relaxed font-futura">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative.
              </p>
              <button className="mt-5 self-start px-6 py-2.5 bg-white border border-gray-900 text-gray-900 text-xs uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full font-futura">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div
          className="hidden md:block cursor-pointer group"
          onClick={() => navigate('/buyback')}
        >
          <div
            className="relative min-h-[500px] lg:min-h-[600px] flex flex-col justify-center px-12 lg:px-16 py-16 font-futura bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: `url(${BUYBACK_IMAGE})` }}
          >
            <div className="absolute inset-0 bg-black/65" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-white font-light font-futura-pt-light">
                <span className="text-2xl md:text-2xl lg:text-2xl block mb-1 font-light font-futura-pt-light">Recycle</span>
                <span className="text-2xl md:text-2xl lg:text-2xl block font-light font-futura-pt-light">Renew</span>
                <span className="text-2xl md:text-2xl lg:text-2xl block mt-1 font-light font-futura-pt-light">Reuse</span>
              </h2>
              <p className="mt-4 text-white/90 text-sm md:text-sm font-light leading-relaxed font-futura">
                We'll buy back your gently used YOBHA pieces for credit. Recycle responsibly with our eco initiative and give your luxury wardrobe a new life.
              </p>
              <button className="mt-6 self-start px-8 py-3 bg-white border border-gray-900 text-gray-900 text-sm uppercase tracking-[0.15em] font-light hover:bg-gray-900 hover:text-white transition-all duration-500 rounded-full font-futura">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12 bg-white font-sweet-sans">
        <div className=" mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
              Shop by Category
            </h2>
            <div className="w-12 md:w-16 h-px bg-gray-300 mx-auto mb-4 md:mb-5" />
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto font-light leading-relaxed">
              Discover timeless elegance across our curated collections
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {genderCategories.map((category) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => {
                  if (category.id === "accessories") {
                    navigate("/Accessories");
                  } else {
                    navigate(`/products/${category.id}`);
                  }
                }}
              >
                <div className="relative h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px] xl:h-[480px] overflow-hidden bg-gray-50/50 border border-gray-100 group-hover:border-gray-200 transition-all duration-700 ease-out">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]" />
                  </div>

                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/5 via-transparent to-black/5 group-hover:from-white/10 group-hover:via-transparent group-hover:to-black/10 transition-all duration-700" />

                  <img
                    src={category.image}
                    alt={category.title}
                    className={`h-full w-full object-cover transition-all duration-[1000ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.03] ${category.id === "couple" ? "object-[center_top]" : ""}`}
                    style={category.id === "couple" ? { objectPosition: "center top" } : {}}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                <div className="mt-3 md:mt-4 text-center">
                  <h3 className="text-[10px] sm:text-[11px] md:text-xs font-light text-gray-900 uppercase group-hover:text-gray-700 transition-colors duration-500 font-sweet-sans">
                    {category.title}
                  </h3>
                  <div className="mt-1.5 md:mt-2 h-[1px] w-0 mx-auto bg-gray-400 group-hover:w-6 md:group-hover:w-8 transition-all duration-700 ease-out" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Image Section */}
      <section className="relative w-full bg-white overflow-hidden">
        <div className="w-full">
          <img
            src="https://in.louisvuitton.com/content/dam/lv/online/picture/allcountry/megamenu/new_formen/2025/MM_Men_New_Monogram_Heritage_Nov2025_DI3_jpg.jpg?wid=2400"
            alt="YOBHA Collection"
            className="w-full h-auto object-cover object-center block"
            loading="lazy"
            onError={(e) => {
              console.error("Failed to load promotional image");
              e.target.style.display = 'none';
            }}
          />
        </div>
      </section>

      {/* YOBHA Services Section - Louis Vuitton Style */}
      <section className="relative w-full bg-white py-12 md:py-16 lg:py-20 font-futura-light-pt">
        <div className="w-full max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
              YOBHA Services
            </h2>
            <p className="text-gray-600 text-xs md:text-sm max-w-3xl mx-auto font-light leading-relaxed font-futura-pt-light">
              YOBHA offers an array of tailored services — including comprehensive support, signature gift wrapping, and exclusive personalisation options.
            </p>
          </div>

          {/* Services Grid - Vertical Panels with spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {/* Services Panel */}
            <div
              className="group cursor-pointer relative overflow-hidden"
              onClick={() => navigate("/buyback")}
            >
              <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
                <img
                  src={BUYBACK_IMAGE}
                  alt="Services"
                  className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDQwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNlcnZpY2VzPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
              </div>
              {/* Title below image */}
              <div className="bg-white py-6 md:py-8 px-6 md:px-8">
                <h3 className="text-sm md:text-base lg:text-lg font-light text-black uppercase font-futura-pt-light">
                  Renewal
                </h3>
              </div>
            </div>

            {/* Art of Gifting Panel */}
            <div
              className="group cursor-pointer relative overflow-hidden"
              onClick={() => navigate("/giftCard-Personalization")}
            >
              <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
                <img
                  src={COUPLE_IMAGE}
                  alt="Art of Gifting"
                  className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDQwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydCBvZiBHaWZ0aW5nPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
              </div>
              {/* Title below image */}
              <div className="bg-white py-6 md:py-8 px-6 md:px-8">
                <h3 className="text-sm md:text-base lg:text-lg font-light text-black uppercase font-futura-pt-light">
                  Art of Gifting
                </h3>
              </div>
            </div>

            {/* Personalisation Panel */}
            <div
              className="group cursor-pointer relative overflow-hidden"
              onClick={() => navigate("/personalization")}
            >
              <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
                <img
                  src={FAMILY_IMAGE}
                  alt="Personalisation"
                  className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDQwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBlcnNvbmFsaXNhdGlvbjwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
              {/* Title below image */}
              <div className="bg-white py-6 md:py-8 px-6 md:px-8">
                <h3 className="text-sm md:text-base lg:text-lg font-light text-black uppercase font-futura-pt-light">
                  Personalisation
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessories Section - The Gift Shop */}


    {false &&  <section
        className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-20 lg:py-24 bg-white font-sweet-sans"
        ref={giftShopRef}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8 font-sweet-sans">
              The Gift Shop
            </h2>
            <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-6 md:mb-8" />
            <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
              Discover timeless elegance across our curated collections
            </p>
          </div>

          {/* Auto-scrolling Carousel Container */}
          <div
            className="relative overflow-hidden w-full group"
            onMouseEnter={() => setIsAccHovered(true)}
            onMouseLeave={() => setIsAccHovered(false)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            {/* Navigation Buttons */}
            <button
              onClick={handleAccPrev}
              className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-gray-300/50 hover:border-gray-400 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 ${isAccHovered ? 'opacity-100' : 'opacity-0'
                }`}
              aria-label="Previous"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleAccNext}
              className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-gray-300/50 hover:border-gray-400 shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 ${isAccHovered ? 'opacity-100' : 'opacity-0'
                }`}
              aria-label="Next"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrolling container */}
            <div
              ref={accessoriesRef}
              className="flex gap-5 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2"
              style={{ cursor: isAccDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleAccMouseDown}
              onMouseLeave={() => setIsAccDragging(false)}
              onTouchStart={() => setIsAccUserInteracting(true)}
              onTouchEnd={() => setTimeout(() => setIsAccUserInteracting(false), 4000)}
              onWheel={() => setIsAccUserInteracting(true)}
            >

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
                    <h4 className="text-base md:text-lg font-light text-gray-900 uppercase tracking-[0.15em] group-hover:text-gray-800 transition-all duration-300 font-sweet-sans">
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
                    <h4 className="text-base md:text-lg font-light text-gray-900 uppercase tracking-[0.15em] group-hover:text-gray-800 transition-all duration-300 font-sweet-sans">
                      {accessory.title}
                    </h4>
                    <div className="mt-2 h-px w-0 mx-auto bg-gray-300 group-hover:w-10 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> }



      {/* Carousel Video Section - Packaging/Manufacturing */}
     { false && <section className="relative w-full py-8 md:py-12 lg:py-16 bg-white font-sweet-sans">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-6 md:mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-6 font-sweet-sans">
                Our Craftsmanship
              </h2>
              <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-4 md:mb-6" />
              <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
                Experience the art of premium manufacturing and packaging
              </p>
            </div>
          </div>
        </div>

        {/* Video Carousel Container - Full Width */}
        {manufacturingVideos.length > 0 && (
          <div
            className="relative w-full aspect-[21/9] overflow-hidden bg-gray-50 group"
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => setIsVideoHovered(false)}
          >
            {/* Video Container */}
            <div className="relative w-full h-full">
              {manufacturingVideos.map((video, index) => (
                <video
                  key={video.id}
                  src={isPortrait ? video.portrait : video.landscape}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  style={{ display: index === currentVideoIndex ? 'block' : 'none' }}
                />
              ))}
            </div>

            {/* Navigation Buttons - Only show if multiple videos */}
            {manufacturingVideos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentVideoIndex((prev) =>
                    prev === 0 ? manufacturingVideos.length - 1 : prev - 1
                  )}
                  className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white border border-gray-300/50 hover:border-gray-400 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ${isVideoHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  aria-label="Previous video"
                >
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setCurrentVideoIndex((prev) =>
                    (prev + 1) % manufacturingVideos.length
                  )}
                  className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white border border-gray-300/50 hover:border-gray-400 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ${isVideoHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  aria-label="Next video"
                >
                  <svg
                    className="w-6 h-6 md:w-7 md:h-7 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Video Indicator Dots - Only show if multiple videos */}
            {manufacturingVideos.length > 1 && (
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {manufacturingVideos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentVideoIndex
                        ? 'w-8 bg-white shadow-lg scale-110'
                        : 'w-2 bg-white/50 hover:bg-white/80 hover:scale-110'
                      }`}
                    aria-label={`Go to video ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Video Title Overlay - Optional */}
            {manufacturingVideos.length > 1 && manufacturingVideos[currentVideoIndex]?.title && (
              <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
                <div className="px-4 py-2 bg-black/70 backdrop-blur-sm">
                  <p className="text-white text-xs md:text-sm uppercase tracking-wider font-light font-sweet-sans">
                    {manufacturingVideos[currentVideoIndex].title}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section> }

      {/* Recently Viewed Section */}
      {recentVisited.length > 0 && (
        <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 bg-white font-sweet-sans">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-2 font-futura-pt-light">
                Recently Viewed
              </h2>
              <p className="text-gray-600 text-xs max-w-xl mx-auto font-light font-sweet-sans">
                Revisit the pieces that caught your eye
              </p>
            </div>

            {/* Products Container */}
            <div className="relative">
              {/* Mobile: Horizontal Scroll */}
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-2 md:hidden">
                {recentVisited.map((item) => (
                  <article
                    key={item.id}
                    className="group cursor-pointer flex-shrink-0 w-[calc((100%-16px)/2)] max-w-[180px]"
                    onClick={() => navigate(`/productDetail/${item.id}`)}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-gray-50 border border-gray-200/50 rounded-lg group-hover:border-gray-300 transition-all duration-300 mb-2">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xs font-light text-gray-900 uppercase tracking-wide line-clamp-2 group-hover:text-luxury-gold transition-colors duration-300 font-sweet-sans">
                        {item.name}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop: Centered Grid */}
              <div className={`hidden md:grid gap-6 justify-items-center mx-auto ${recentVisited.length === 1
                ? 'grid-cols-1 max-w-xs'
                : recentVisited.length === 2
                  ? 'grid-cols-2 max-w-xl'
                  : recentVisited.length === 3
                    ? 'grid-cols-3 max-w-3xl'
                    : recentVisited.length === 4
                      ? 'grid-cols-4 max-w-4xl'
                      : 'grid-cols-4 lg:grid-cols-6 max-w-5xl'
                }`}>
                {recentVisited.map((item) => (
                  <article
                    key={item.id}
                    className="group cursor-pointer w-full max-w-[200px]"
                    onClick={() => navigate(`/productDetail/${item.id}`)}
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-gray-50 border border-gray-200/50 rounded-xl group-hover:border-gray-300 group-hover:shadow-lg transition-all duration-300 mb-3">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-light text-gray-900 uppercase tracking-wide line-clamp-2 min-h-[2rem] group-hover:text-luxury-gold transition-colors duration-300 font-sweet-sans">
                        {item.name}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Follow Us on Instagram Section */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12 bg-white font-sweet-sans">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-3 font-futura-pt-light">
            Follow Us
          </h2>
          <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto font-light mb-6 md:mb-8 font-sweet-sans">
            Join our community on Instagram for the latest updates and exclusive content
          </p>

          <div className="flex justify-center items-center">
            <a
              href="https://www.instagram.com/yobha.world"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 border border-gray-900/20 hover:border-gray-900 bg-transparent hover:bg-gray-900 transition-all duration-500 font-sweet-sans rounded-full"
            >
              {/* Instagram Icon */}
              <div className="relative">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-gray-900 group-hover:text-white transition-colors duration-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              {/* Text */}
              <span className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] text-gray-900 group-hover:text-white transition-colors duration-500 font-light font-sweet-sans">
                YOBHA.WORLD
              </span>
              {/* Arrow */}
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-gray-900 group-hover:text-white transition-colors duration-500 transform group-hover:translate-x-1 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      {false && <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20 bg-premium-white font-sweet-sans overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.015] pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 md:w-64 md:h-64 border border-gray-900/30 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 border border-gray-900/30 rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Decorative line above heading */}
          <div className="flex items-center justify-center mb-4 md:mb-5">
            <div className="h-px w-10 md:w-16 bg-gray-300/60"></div>
            <div className="mx-2 md:mx-3 w-1 h-1 rounded-full bg-gray-400/60"></div>
            <div className="h-px w-10 md:w-16 bg-gray-300/60"></div>
          </div>

          <h2 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-3 font-futura-pt-light">
            Newsletter
          </h2>

          <p className="text-gray-600 text-xs md:text-sm max-w-xl mx-auto font-light mb-8 md:mb-10 font-sweet-sans leading-relaxed">
            Subscribe to receive updates, access to exclusive deals, and more
          </p>

          {/* Enhanced form container */}
          <form onSubmit={handleNewsletterSubmit} className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Form wrapper with elegant border and shadow */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch sm:items-center">
                {/* Email input wrapper */}
                <div className="flex-1 relative bg-white border border-gray-200/80 hover:border-gray-300 transition-all duration-500 shadow-sm hover:shadow-md rounded-sm">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 text-sm md:text-base border-0 focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400/70 font-light font-sweet-sans"
                    disabled={isSubscribing}
                  />
                  {/* Focus indicator line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gray-900 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>

                {/* Divider - visible on desktop */}
                <div className="hidden sm:block w-px h-10 bg-gray-200/60 mx-3"></div>

                {/* Submit button wrapper */}
                <div className="sm:bg-white sm:border sm:border-gray-200/80 sm:hover:border-gray-300 sm:transition-all sm:duration-500 sm:shadow-sm sm:hover:shadow-md sm:rounded-sm">
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-gray-900 hover:bg-gray-800 text-white text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] font-light transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed font-sweet-sans whitespace-nowrap relative overflow-hidden group/btn rounded-sm sm:rounded-sm"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubscribing ? (
                        <>
                          <span>Subscribing...</span>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </span>
                    {/* Button hover effect */}
                    <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional info text */}
            <p className="mt-4 md:mt-5 text-xs text-gray-500/80 font-light font-sweet-sans">
              Join our community and stay updated with the latest collections
            </p>
          </form>

          {/* Decorative line below form */}
          <div className="flex items-center justify-center mt-6 md:mt-8">
            <div className="h-px w-10 md:w-16 bg-gray-300/60"></div>
            <div className="mx-2 md:mx-3 w-1 h-1 rounded-full bg-gray-400/60"></div>
            <div className="h-px w-10 md:w-16 bg-gray-300/60"></div>
          </div>
        </div>
      </section> }
    </div>
  );
};

export default HomePage2;

