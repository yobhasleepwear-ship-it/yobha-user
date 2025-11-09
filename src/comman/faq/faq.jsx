import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "What does YOBHA stand for?",
      answer: "YOBHA is a sanctuary of stillness — where modern comfort meets timeless craftsmanship. Born from a desire to reimagine the essence of home, YOBHA creates loungewear, homewear, and sleepwear that transcend generations."
    },
    {
      question: "What makes YOBHA different from other brands?",
      answer: "Every YOBHA creation is a dialogue between comfort and art. We embody quiet luxury — crafted not to impress but to express presence, grace, and ease across our collections for men, women, children, and pets."
    },
    {
      question: "Do you offer matching sets for families?",
      answer: "Yes. YOBHA celebrates togetherness through matching sets for couples, children, and even pets — designed to reflect harmony, comfort, and timeless connection."
    },
    {
      question: "Where are YOBHA pieces made?",
      answer: "Crafted in select ateliers that embody excellence and integrity, each piece is handled by artisans who master the poetry of precision — made with devotion and calm."
    },
    {
      question: "What materials do you use?",
      answer: "We use premium, sustainable fabrics such as organic cotton, bamboo blends, and plant-based silks — ensuring softness, breathability, and harmony with nature."
    },
    {
      question: "Is YOBHA a seasonal brand?",
      answer: "Our creations are timeless, not seasonal. YOBHA believes in slow creation and the beauty of continuity — fashion that transcends trends and time."
    },
    {
      question: "Do you offer worldwide shipping?",
      answer: "Yes. We ship globally with utmost care, each order wrapped with intention and delivered with the serenity that defines YOBHA."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "Our Client Care Team ensures every return or exchange is handled with discretion and grace, provided the item is in its original condition and packaging."
    },
    {
      question: "Does YOBHA offer a restoration or buyback program?",
      answer: "Yes. Select collections qualify for restoration or buyback — reflecting our commitment to conscious luxury and circular craftsmanship."
    },
    {
      question: "How do I care for my YOBHA pieces?",
      answer: "Gentle washing, air drying, and mindful storage preserve each piece's softness and balance. Every item includes care guidance for longevity."
    }
  ];

  return (
    <section id="faq" className="bg-white py-12 sm:py-20 font-futura">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-black uppercase tracking-widest mb-4 sm:mb-5">
            Frequently Asked Questions
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-black mx-auto rounded-full"></div>
          <p className="mt-3 sm:mt-4 text-text-dark text-xs sm:text-sm tracking-wide uppercase">
            Calm • Connection • Conscious Living
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 sm:space-y-6">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`bg-white border shadow-sm transition-all duration-300 ${
                expandedFaq === index
                  ? 'border-luxury-gold shadow-lg'
                  : 'border-text-light/10 hover:border-luxury-gold/30'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-left flex items-center justify-between transition-all duration-300 ${
                  expandedFaq === index
                    ? 'bg-luxury-gold/5'
                    : 'hover:bg-premium-beige/20'
                }`}
              >
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black uppercase tracking-wide pr-3 sm:pr-4 md:pr-6 leading-tight">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-luxury-gold transition-transform duration-300" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-luxury-gold transition-transform duration-300" strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {expandedFaq === index && (
                <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 border-t border-luxury-gold/20 bg-luxury-gold/5">
                  <p className="text-text-dark leading-relaxed pt-4 sm:pt-6 text-sm sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;


