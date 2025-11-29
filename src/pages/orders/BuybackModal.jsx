import React from "react";
import { X, CreditCard, Wrench, Recycle } from "lucide-react";

const TRADE_IN_OPTIONS = [
  {
    id: "credit",
    title: "Trade-in for Credit",
    description: "Return your YOBHA garment and earn Care Credit.",
    icon: CreditCard,
  },
  {
    id: "repair",
    title: "Repair & Reuse",
    description: "We'll fix and send it back to you.",
    icon: Wrench,
  },
  {
    id: "recycle",
    title: "Recycle",
    description: "Let us recycle it responsibly.",
    icon: Recycle,
  },
];

const BuybackModal = ({ isOpen, onClose, onSelectOption, order }) => {
  if (!isOpen) return null;

  const handleOptionSelect = (optionId) => {
    onSelectOption(optionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-light text-black font-futura-pt-book">
            Choose Buyback Option
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6">
          {order && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
              <p className="text-sm text-black mb-2 font-light font-futura-pt-book">
                Order Details
              </p>
              <p className="text-base font-light text-black font-futura-pt-light">
                Order ID: <span className="font-futura-pt-book">{order.id || order.orderNo}</span>
              </p>
              {order.items && order.items.length > 0 && (
                <p className="text-sm font-light text-black mt-1 font-futura-pt-light">
                  {order.items.length} item(s) in this order
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:gap-5 md:grid-cols-3">
            {TRADE_IN_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option.id)}
                  className="group relative flex flex-col items-center justify-between text-center px-4 py-6 md:px-5 md:py-7 transition-all duration-300 h-full bg-white border-2 border-gray-300 hover:border-black text-black"
                  style={{ height: '240px' }}
                >
                  <div className="mb-4 transition-colors flex-shrink-0 text-black">
                    <IconComponent className="w-12 h-12 md:w-14 md:h-14 stroke-[1.2]" />
                  </div>
                  
                  <h3 className="text-base md:text-lg lg:text-xl font-light mb-3 transition-colors leading-tight flex-shrink-0 text-black font-futura-pt-book">
                    {option.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm leading-relaxed transition-colors mt-auto text-center flex-shrink-0 text-black font-light font-futura-pt-light">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuybackModal;

