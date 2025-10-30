import React, { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import Router from "./router";
import "./App.css";
import AxiosInterceptorProvider from "./interceptors/axiosInterceptorProvider";
import { store } from "./redux/store";
import { Provider, useDispatch } from "react-redux";
import { getCartDetails } from "./service/productAPI";
import { setCartCount } from "./redux/cartSlice"; 
import ToastContainer from "./comman/toster-message/ToastContainer";
import ScrollToTop from "./ScrollToTop";
import { LocalStorageKeys } from "./constants/localStorageKeys";
import * as localStorageService from "./service/localStorageService";
import "./i18n";
import { useTranslation } from "react-i18next";
import CountryDropdown from "./countryDropdown";

function AppContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const [countryConfirmed, setCountryConfirmed] = useState(false); 

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  }, [i18n]);
  useEffect(() => {
    console.log("🔍 Current URL:", window.location.href);
    const hash = window.location.hash;
    if (hash.includes("token=")) {
      const token = hash.split("token=")[1];
      if (token) {
        localStorageService.setValue(LocalStorageKeys.AuthToken, token);
        localStorageService.setValue(LocalStorageKeys.User, JSON.stringify({ provider: "Google" }));
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/home"); 
      }
    }
  }, [navigate]);
  const fetchCart = async () => {
    try {
      const response = await getCartDetails();
      const count = response.data.items.length;
      dispatch(setCartCount(count)); 
    } catch (err) {
      console.log(err || "something went wrong");
    }
  };
  useEffect(() => {
    fetchCart();
  }, []);
  return (
   <ScrollToTop>
      {!countryConfirmed ? (
        <div style={{ padding: "10px" }}>
          <CountryDropdown onConfirmed={() => { setCountryConfirmed(true); navigate('/home'); }} />
        </div>
      ) : (
        <Router />
      )}
    </ScrollToTop>
  );
}
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AxiosInterceptorProvider>
          <AppContent />
          <ToastContainer />
        </AxiosInterceptorProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
