import { useEffect, useState, useRef } from "react";
import Giftimg from "../../assets/gifting.jpeg";
/* ---------------- SECTION UI COMPONENTS ---------------- */

function DescriptionUI({
    content,
    keyFeatures,
    selectedColor,
    productCode,
}) {
    return (
        <div className="space-y-3">
            {/* Description */}
            <p className="text-xs text-black leading-relaxed font-light font-futura-pt-light" style={{ fontWeight: 600 }}>
                {content}
            </p>

            {/* Key Features + Meta (same style) */}
            <div className="space-y-1.5">
                {/* Key Features (from index 1 onward) */}
                {Array.isArray(keyFeatures) &&
                    keyFeatures.length > 1 &&
                    keyFeatures.slice(1).map((feature, index) => (
                        <p
                            key={index}
                            className="text-xs text-black font-light leading-relaxed font-futura-pt-light"
                            style={{ fontWeight: 600 }}
                        >
                            {feature}
                        </p>
                    ))}

                {/* Colour */}
                {selectedColor && (
                    <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 600 }}>
                        Colour: {selectedColor}
                    </p>
                )}

                {/* Product Code */}
                {productCode && (
                    <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 600 }}>
                        Product Code: {productCode}
                    </p>
                )}
            </div>
        </div>
    );
}





function CareInstructionsUI({ content }) {
    return (
        <div className="space-y-1.5">
            {content?.map((item, index) => (
                <p
                    key={index}
                    className="text-xs text-black font-light leading-relaxed font-futura-pt-light"
                    style={{ fontWeight: 600 }}
                >
                    {item}
                </p>
            ))}
        </div>
    );
}


function DeliveryReturnUI({ content }) {
    return (
        <div className="space-y-2 text-xs text-black font-light leading-relaxed">
            <p className="text-l text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 600 }}>{content}</p>
        </div>
    );
}

function GiftPackagingUI({ content }) {
    return (
        <> <p className="text-l text-black font-light leading-relaxed font-futura-pt-light mb-2" style={{ fontWeight: 600 }}>{content}</p>
            <img
                src={Giftimg} // 👈 change path if needed
                alt="Gift Packaging"
                style={{
                    width: "100%",
                    maxWidth: "320px",
                    height: "auto",
                    objectFit: "contain",
                }}
            />

        </>
    );
}

/* ---------------- SECTION CONFIG ---------------- */

const SECTION_CONFIG = {
    description: {
        title: "PRODUCT DETAILS",
        component: DescriptionUI,
    },
    "care Instructions": {
        title: "MATERIAL AND CARE",
        component: CareInstructionsUI,
    },
    "delivery And Return": {
        title: "DELIVERY & RETURNS",
        component: DeliveryReturnUI,
    },
    "gift Packaging": {
        title: "GIFT PACKAGING",
        component: GiftPackagingUI,
    },
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function SlidePanel({
    open,
    onClose,
    sectionName,
    sectionContent,
    keyFeatures
    , selectedColor,
    productCode
}) {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const panelRef = useRef();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [open, onClose]);

    const sectionConfig = SECTION_CONFIG[sectionName];
    if (!sectionConfig) return null;

    const SectionComponent = sectionConfig.component;

    /* ---------------- STYLES ---------------- */

    const panelStyle = {
        position: "absolute",
        top: 0,
        right: isDesktop ? 0 : "auto",
        left: isDesktop ? "auto" : 0,
        background: "#fff",
        zIndex: 50,
        transition: "transform 0.35s ease",
        width: isDesktop ? "48%" : "100%",
        height: isDesktop ? "100%" : "50%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        transform: open
            ? "translate(0,0)"
            : isDesktop
                ? "translateX(100%)"
                : "translateY(-100%)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        textAlign: "left",
    };

    const closeButtonStyle = {
        position: "absolute",
        top: isDesktop ? 90 : 10,
        right: 10,
        cursor: "pointer",
        fontSize: 18,
        background: "transparent",
        border: "none",
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div ref={panelRef} style={panelStyle}>
            <button style={closeButtonStyle} onClick={onClose}>
                ✕
            </button>

            <div style={{display:'flex' , justifyContent:'flex-start' , flexDirection:'column'}}>


                <h3
                    className="text-md font-light text-black font-futura-pt-light mb-2.5"
                    style={{ fontWeight: 600, fontSize: "1.05rem" }}
                >
                    {sectionConfig.title}
                </h3>

                <SectionComponent
                    content={sectionContent}
                    keyFeatures={sectionName === "description" ? keyFeatures : undefined}
                    selectedColor={sectionName === "description" ? selectedColor : undefined}
                    productCode={sectionName === "description" ? productCode : undefined}
                />

            </div>
        </div>
    );
}
