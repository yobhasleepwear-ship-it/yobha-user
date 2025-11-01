import React from "react";
import Header from "../app-header/app-header";
import Footer from "../footer/footer";

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="md:pt-240px lg:pt-240px">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
