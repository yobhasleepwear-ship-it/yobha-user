import React, { useMemo, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFilteredProducts } from "../../../service/productAPI";

const TrendingNewArrivals = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageIndices, setImageIndices] = useState({});
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // ✅ Fetch your API data
  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-rotate images for each product
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        // Update indices for all products that have multiple images
        products.forEach(product => {
          if (product.images && product.images.length > 1) {
            const currentIndex = prev[product.id] || 0;
            newIndices[product.id] = (currentIndex + 1) % product.images.length;
          }
        });
        return newIndices;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [products]);

  // Initialize image indices when products change
  useEffect(() => {
    if (products.length > 0) {
      const initialIndices = {};
      products.forEach(product => {
        initialIndices[product.id] = 0;
      });
      setImageIndices(initialIndices);
    }
  }, [products]);

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
        pageSize: 12, // Increased for better grid display
        sort: "latest",
        country: null,
      };

      const response = await getFilteredProducts(payload);
      if (response && response.success && response.data) {
        const fetchedProducts = response.data.items || [];
        setProducts(fetchedProducts);
        
        // Initialize image indices for carousel will be done in displayProducts useEffect
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

  // ✅ Format product for display
  const displayProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products
      .filter((p) => p.available)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        title: p.name || "Untitled Product",
        price: p.price ? `₹${p.price.toLocaleString("en-IN")}` : "Price not available",
        image: p.images?.[0] || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=",
        images: p.images || [], // Preserve the full images array for carousel
        badge: p.productMainCategory || "New",
        slug: p.productId,
        category: p.category || "Luxury Collection"
      }));
  }, [products]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-premium-cream overflow-hidden"
      style={{ fontFamily: "'SweetSans', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif" }}
    >
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-luxury-gold/30 rotate-45"></div>
        <div className="absolute top-20 right-16 w-16 h-16 border border-luxury-gold/30 rotate-12"></div>
        <div className="absolute bottom-16 left-16 w-18 h-18 border border-luxury-gold/30 -rotate-12"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 border border-luxury-gold/30 rotate-45"></div>
      </div>

      {/* Section Header - Premium Typography */}
      <div className="relative z-10 text-center mb-12 md:mb-16">
        <div className="overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 uppercase tracking-widest mb-6 transform translate-y-0 opacity-100 transition-all duration-1000">
            New Arrivals
          </h2>
        </div>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
        <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
          Discover our latest collection of premium essentials, crafted with meticulous attention to detail
        </p>
      </div>

      {/* Premium Product Grid - Enhanced Mobile Responsiveness */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-luxury-gold/20 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-luxury-gold rounded-full animate-spin"></div>
            </div>
            <p className="text-text-medium text-lg font-medium">Loading products...</p>
          </div>
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {displayProducts.map((product, index) => (
            <article
              key={product.id}
              className="group bg-white/95 backdrop-blur-sm border border-gray-100/50 overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-700 flex flex-col relative transform hover:-translate-y-2"
              onClick={() => navigate(`/productDetail/${product.id}`)}
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              {/* Luxury Gold Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold"></div>

              {/* Product Image Container - Auto Moving Images */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="absolute inset-0 overflow-hidden">
                  {/* Image Carousel - Show multiple images if available */}
                  {(() => {
                    // Find the original product data to get the full images array
                    const originalProduct = products.find(p => p.id === product.id);
                    const productImages = originalProduct?.images || product.images || [];
                    return productImages.length > 1;
                  })() ? (
                    <div className="relative w-full h-full">
                      {(() => {
                        const originalProduct = products.find(p => p.id === product.id);
                        const productImages = originalProduct?.images || product.images || [];
                        return productImages;
                      })().map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`${product.title} - Image ${imgIndex + 1}`}
                          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
                            imageIndices[product.id] === imgIndex ? 'opacity-100' : 'opacity-0'
                          } ${
                            hoveredCard === product.id 
                              ? 'scale-110 rotate-2' 
                              : 'scale-100 rotate-0'
                          }`}
                          style={{
                            animation: hoveredCard === product.id 
                              ? 'floatImage 3s ease-in-out infinite' 
                              : 'none'
                          }}
                          onError={(e) =>
                            (e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+")
                          }
                        />
                      ))}
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {(() => {
                          const originalProduct = products.find(p => p.id === product.id);
                          const productImages = originalProduct?.images || product.images || [];
                          return productImages;
                        })().map((_, imgIndex) => (
                          <div
                            key={imgIndex}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              imageIndices[product.id] === imgIndex 
                                ? 'bg-white shadow-lg' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Single Image Fallback */
                    <img
                      src={product.image}
                      alt={product.title}
                      className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
                        hoveredCard === product.id 
                          ? 'scale-110 rotate-2' 
                          : 'scale-100 rotate-0'
                      }`}
                      style={{
                        animation: hoveredCard === product.id 
                          ? 'floatImage 3s ease-in-out infinite' 
                          : 'none'
                      }}
                      onError={(e) =>
                        (e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+")
                      }
                    />
                  )}
                </div>

                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-700"></div>

                {/* Luxury Badge - Enhanced */}
                {product.badge && (
                  <span className="absolute top-4 left-4 text-xs px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 font-light uppercase tracking-widest group-hover:bg-luxury-gold group-hover:text-white transition-all duration-500 transform group-hover:scale-105">
                    {product.badge}
                  </span>
                )}

                {/* Premium Border Effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-luxury-gold/40 transition-all duration-700"></div>

                {/* Quick View Button - Enhanced */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <button className="px-6 py-3 bg-white/95 backdrop-blur-sm text-gray-900 font-light text-xs uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-all duration-500 transform hover:scale-105 shadow-lg">
                    Quick View
                  </button>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-luxury-gold/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-luxury-gold/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>

              {/* Product Details - Premium Typography */}
              <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1 bg-white/95 backdrop-blur-sm border-t border-gray-100/50">

                {/* Product Info - Enhanced */}
                <div className="mb-4 flex-1">
                  <h3 className="text-gray-900 font-light text-sm sm:text-base md:text-lg tracking-wide uppercase leading-relaxed line-clamp-2 min-h-[2.5rem] transition-colors duration-500 group-hover:text-luxury-gold">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm font-light italic line-clamp-1 mt-2 tracking-wide">
                    {product.category}
                  </p>
                </div>

                {/* Premium Divider + CTA */}
                <div className="mt-auto pt-4 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="text-luxury-gold text-xs sm:text-sm uppercase font-light tracking-widest group-hover:text-gray-900 transition-all duration-500 ease-in-out flex items-center gap-2">
                      <span>Explore</span>
                      <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500">→</span>
                    </div>
                  </div>
                </div>

              </div>

            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-text-medium text-lg">No products available at the moment.</p>
          <p className="text-text-light text-sm mt-2">Check back soon for new arrivals</p>
        </div>
      )}

      {/* Premium Call-to-Action */}
      {displayProducts.length > 0 && (
        <div className="text-center mt-16 md:mt-20">
          <button
            onClick={() => navigate('/products')}
            className="px-8 sm:px-12 py-4 sm:py-5 bg-white/95 backdrop-blur-sm text-gray-900 font-light text-sm sm:text-base uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-all duration-700 transform hover:scale-105 border border-gray-200 hover:border-luxury-gold shadow-lg hover:shadow-2xl"
          >
            Discover Collection
          </button>
        </div>
      )}

      {/* Premium Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floatImage {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-floatImage {
          animation: floatImage 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default TrendingNewArrivals;
