import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./comman/app-layout/app-layout";
import logoImage from "./assets/yobhaLogo.png"
// Lazy load pages
const Home = lazy(() => import("./pages/Home/home2"));
const Login = lazy(() => import("./pages/login/login"))
const ProductsPage = lazy(() => import("./pages/product/product"));
const ProductDescription = lazy(() => import("./pages/product-description/product-description"))
const Cart = lazy(() => import("./pages/cart/cart"));
const Checkout = lazy(() => import("./pages/checkout/checkout"));
const Wishlist = lazy(() => import("./pages/wishlist/wishlist"));
const Orders = lazy(() => import("./pages/orders/orders"));
const OrderDetails = lazy(() => import("./pages/order-details/order-details"));
const Account = lazy(() => import("./pages/account/account"));
const Contact = lazy(() => import("./pages/contact/contact"))
const About = lazy(() => import("./pages/about/about"))
const FAQ = lazy(() => import("./pages/faq/faq"))
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy/privacy-policy"));
const TermsConditions = lazy(() => import("./pages/terms-conditions/terms-conditions"));
const ReturnPolicy = lazy(() => import("./pages/return-policy/return-policy"));
const Buyback = lazy(() => import("./pages/buyback/buyback"))
const FabricProtection = lazy(() => import("./pages/fabric-protection/fabric-protection"));
const Router = () => {
  const routes = [
    // { path: "/", element: <Navigate to="/home" replace /> },
    { path: "/home", element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: "/products/:category?", element: <ProductsPage /> },
    { path: "/productDetail/:productId?", element: <ProductDescription /> },
    { path: "/cart", element: <Cart /> },
    { path: "/checkout/:pageProps", element: <Checkout /> },
    {path: "/checkout", element: <Checkout /> },
    { path: "/wishlist", element: <Wishlist /> },
    { path: "/orders", element: <Orders /> },
    { path: "/order-details/:orderId", element: <OrderDetails /> },
    { path: "/account", element: <Account /> },
    { path: '/contact', element: <Contact /> },
    { path: '/about', element: <About /> },
    { path: '/faq', element: <FAQ /> },
    { path: '/privacy-policy', element: <PrivacyPolicy /> },
    { path: '/terms-conditions', element: <TermsConditions /> },
    { path: '/return-policy', element: <ReturnPolicy /> },
    {path:'/buyback',element:<Buyback/>},
    {path:'/fabric-protection', element:<FabricProtection />}
  ];

  return (
    <Suspense fallback={ <div className="flex items-center justify-center h-screen">
      <img
        src={logoImage}
        alt="YOBHA Logo"
        className="h-8 md:h-10"
      />
    </div>}>
      <Routes>
        {routes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={path === "/login" ? element : <AppLayout>{element}</AppLayout>}
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default Router;
