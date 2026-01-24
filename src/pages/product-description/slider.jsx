import { useEffect, useState, useRef } from "react";
import Giftimg from "../../assets/gifting.jpeg";
/* ---------------- SECTION UI COMPONENTS ---------------- */
function CareGuideModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-white">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
                <p
                    className="text-sm text-black font-futura-pt-light"
                    style={{ fontWeight: 600 }}
                >
                    CARE GUIDE
                </p>

                <button
                    className="text-lg"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-5 py-4 overflow-y-auto h-[calc(100vh-64px)]">
                <div
                    className="space-y-3 text-xs text-black leading-relaxed font-futura-pt-light"
                    style={{ fontWeight: 700 }}
                >
                    <p className="text-sm">YOBHA</p>

                    <p>
                        YOBHA pieces are crafted with intention, using refined,
                        plant-based and engineered fabrics designed to offer a
                        silk-like fluidity without the use of animal-derived silk.
                        This guide is designed to help preserve the beauty,
                        comfort, and longevity of your garment.
                    </p>

                    <p>
                        Please always refer to the specific care instructions
                        listed on the product page, as these are tailored to the
                        fabric and construction of each individual piece.
                    </p>

                    <p>HAND WASHING</p>
                    <p>
                        Our fabrics benefit from gentle handling and thoughtful
                        care. Where possible, spot clean and allow garments to
                        rest between wears. When washing is required, hand wash
                        in cool water using a specialist mild detergent. Do not
                        soak. Rinse gently and avoid wringing to maintain the
                        fabric’s structure and drape.
                    </p>

                    <p>AIR DRYING & IRONING</p>
                    <p>
                        Air dry naturally and never tumble dry. Dry flat or hang
                        with care, away from direct heat or sunlight. Iron or
                        steam on the lowest heat setting to restore a smooth
                        finish and subtle sheen. For best results, iron on the
                        reverse side or use a cotton cloth as a barrier.
                    </p>

                    <p>DELICATE & KNIT FABRICS</p>
                    <p>
                        Store delicate and knit pieces folded and laid flat to
                        preserve their shape. Avoid excessive friction. If
                        pilling occurs, refresh gently using an electric fabric
                        shaver. Do not use abrasive tools.
                    </p>

                    <p>EMBELLISHED & SPECIAL PIECES</p>
                    <p>
                        Garments featuring embroidery, embellishment, or surface
                        detailing require professional dry cleaning only. We do
                        not recommend ironing these pieces. If necessary, steam
                        lightly from a distance to protect the detailing.
                    </p>

                    <p>CONSIDERED CARE</p>
                    <p>
                        Thoughtful garment care extends the life of your YOBHA
                        pieces and supports a more mindful approach to dressing.
                        Reduced washing, air drying, and gentle handling help
                        preserve fabric quality while minimising environmental
                        impact.
                    </p>
                </div>
            </div>
        </div>
    );
}


function DescriptionUI({
    content,
    keyFeatures,
    selectedColor,
    productCode,
}) {
    return (
        <div className="space-y-3">
            {/* Description */}
            <p className="text-xs text-black leading-relaxed font-light font-futura-pt-light" style={{ fontWeight: 700 }}>
                {content}
            </p>

            {/* Key Features + Meta (same style) */}
            <div className="space-y-1.5">
                {/* Key Features (from index 1 onward) */}
                {Array.isArray(keyFeatures) &&
                    keyFeatures.length > 1 &&
                    keyFeatures.slice(2).map((feature, index) => (
                        <p
                            key={index}
                            className="text-xs text-black font-light leading-relaxed font-futura-pt-light"
                            style={{ fontWeight: 700 }}
                        >
                            {feature}
                        </p>
                    ))}

                {/* Colour */}
                {selectedColor && (
                    <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 700 }}>
                        Colour: {selectedColor}
                    </p>
                )}

                {/* Product Code */}
                {productCode && (
                    <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 700 }}>
                        Product Code: {productCode}
                    </p>
                )}
            </div>
        </div>
    );
}





function CareInstructionsUI({ content }) {
    const [openCareGuide, setOpenCareGuide] = useState(false);
    return (
        <div className="space-y-1.5">
            {content?.map((item, index) => (
                <p
                    key={index}
                    className="text-xs text-black font-light leading-relaxed font-futura-pt-light"
                    style={{ fontWeight: 700 }}
                >
                    {item}
                </p>
            ))}
            <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light"
                    style={{ fontWeight: 700 }}>For further guidance,please refer to our <u onClick={()=>setOpenCareGuide(true)}>Care Guide</u>.</p>
        <CareGuideModal
                open={openCareGuide}
                onClose={() => setOpenCareGuide(false)}
            />
        </div>
    );
}


function DeliveryReturnUI({ content }) {
    return (
        <div className="space-y-2 text-xs text-black font-light leading-relaxed">
            <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light" style={{ fontWeight: 700 }}>{content}</p>
        </div>
    );
}

function GiftPackagingUI({ content }) {
    return (
        <> <p className="text-xs text-black font-light leading-relaxed font-futura-pt-light mb-2" style={{ fontWeight: 700 }}>{content}</p>
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
