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
import LoginModal from "./pages/login/loginModal";
import { addToWishlist } from "./service/wishlist";
import { invalidateWishlistCache } from "./service/wishlistCache";
import { incrementWishlistCount } from "./redux/wishlistSlice";
import { message } from "./comman/toster-message/ToastContainer";

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
  // Helper function to execute pending wishlist action after login
  const executePendingWishlistAction = async () => {
    try {
      const pendingActionStr = localStorageService.getValue("pendingWishlistAction");
      if (pendingActionStr) {
        const pendingAction = JSON.parse(pendingActionStr);
        // Check if action is not too old (e.g., within 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - pendingAction.timestamp < oneHour) {
          await addToWishlist(pendingAction.productId, pendingAction.payload);
          invalidateWishlistCache();
          dispatch(incrementWishlistCount());
          message.success("Product added to wishlist!");
        }
        // Clear pending action regardless of success/age
        localStorageService.removeValue("pendingWishlistAction");
      }
    } catch (error) {
      console.error("Failed to execute pending wishlist action:", error);
      // Clear pending action on error to avoid retry loops
      localStorageService.removeValue("pendingWishlistAction");
    }
  };

  useEffect(() => {
    console.log("🔍 Current URL:", window.location.href);
    const hash = window.location.hash;
    if (hash.includes("token=")) {
      const token = hash.split("token=")[1];
      if (token) {
        localStorageService.setValue(LocalStorageKeys.AuthToken, token);
        localStorageService.setValue(LocalStorageKeys.User, JSON.stringify({ provider: "Google" }));
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Execute pending wishlist action if any
        executePendingWishlistAction();
        
        const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
        localStorageService.removeValue("redirectAfterLogin");
        navigate(redirectTo, { replace: true }); 
      }
    }
  }, [navigate, dispatch]);
  const fetchCart = async () => {
    try {
     const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
       
          dispatch(setCartCount(storedCart.length));
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
          <CountryDropdown onConfirmed={() => { setCountryConfirmed(true); }} />
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
          {/* <LoginModal /> */}

          <AppContent />
          <ToastContainer />
        </AxiosInterceptorProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
