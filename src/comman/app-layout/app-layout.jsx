import React from "react";
import Header from "../app-header/app-header";
import Footer from "../footer/footer";

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="mt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
