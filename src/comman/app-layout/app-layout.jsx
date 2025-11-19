import React, { useEffect, useRef, useState } from "react";
import Header from "../app-header/app-header2";
import Footer from "../footer/footer";

const AppLayout = ({ children }) => {
 
  return (
    <div className="app-layout">
      <Header />
      <main  className="md:pt-240px lg:pt-240px">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
