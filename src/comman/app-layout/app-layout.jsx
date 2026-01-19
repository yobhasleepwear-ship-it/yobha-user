import React, { useEffect, useRef, useState } from "react";
import Header from "../app-header/app-header2";
import Footer from "../footer/footer";
import WhatsAppButton from "../whatsapp-button/WhatsAppButton";

const AppLayout = ({ children }) => {
 
  return (
    <div className="app-layout" style={{ overflowX: 'hidden' }}>
      <Header />
      <main  className="md:pt-240px lg:pt-240px">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AppLayout;
