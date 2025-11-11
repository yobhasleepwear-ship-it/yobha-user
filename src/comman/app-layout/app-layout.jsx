import React, { useEffect, useState } from "react";
import Header from "../app-header/app-header2";
import Footer from "../footer/footer";

const AppLayout = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
    const handleScroll = () => {
      console.log(window.scrollY, "window.scrollY");
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run once on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
    
  return (
    <div className="app-layout">
      <Header isScrolled={isScrolled}/>
      <main className="md:pt-240px lg:pt-240px">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
