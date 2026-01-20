import { useEffect, useState, useRef } from "react";

export default function SlidePanel({ open, onClose, sectionName, sectionContent }) {
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
            document.addEventListener("touchstart", handleClickOutside); // 👈 add this
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside); // 👈 remove too
        };
    }, [open, onClose]);


    if (!sectionContent) return null;

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
        justifyContent: "center", // vertical center
        alignItems: "center",     // horizontal center
        overflowY: "auto",
        textAlign: "center",      // center text inside
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

    return (
        <div ref={panelRef} style={panelStyle}>
            <button style={closeButtonStyle} onClick={onClose}>
                ✕
            </button>

            <h3 className="text-md font-light text-black font-futura-pt-light mb-2.5"     style={{ fontWeight: 500, fontSize: "1.05rem" }}>
                {sectionName}
            </h3>

            {Array.isArray(sectionContent) ? (
                <ul className="space-y-1.5 list-disc pl-0" >
                    {sectionContent.map((item, index) => (
                        <li
                            key={index}
                                style={{ fontWeight: 400, fontSize: "1.00rem" }}
                            className="text-xs text-black font-light leading-relaxed font-futura-pt-thin"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-black leading-relaxed font-light font-futura-pt-light">
                    {sectionContent}
                </p>
            )}
        </div>
    );
}
