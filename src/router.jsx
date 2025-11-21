import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
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

const Account = lazy(() => import("./pages/account/account2"));
const Contact = lazy(() => import("./pages/contact/contact"))
const About = lazy(() => import("./pages/about/about"))
const FAQ = lazy(() => import("./pages/faq/faq"))
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy/privacy-policy"));
const TermsConditions = lazy(() => import("./pages/terms-conditions/terms-conditions"));
const ReturnPolicy = lazy(() => import("./pages/return-policy/return-policy"));
const Buyback = lazy(() => import("./pages/buyback/buyback"))
const Buyback3 = lazy(() => import("./pages/buyback3/buyback3"))
const BuybackFromOrder = lazy(() => import("./pages/buyback-from-order/buyback-from-order"))
const FabricProtection = lazy(() => import("./pages/fabric-protection/fabric-protection"));
const Careers = lazy(() => import("./pages/careers/careers"));
const CareerDetails = lazy(() => import("./pages/careers/career-details"));
const CareerApply = lazy(() => import("./pages/careers/career-apply"));
const GiftCardPersonalize = lazy(() => import("./pages/giftCard-Personalization/giftCard-Personalization"));
const GiftCardPurchase = lazy(() => import("./pages/gift-card-purchase/gift-card-purchase"));
const GiftsPersonalization = lazy(() => import("./pages/gifts-personalization/gifts-personalization"));
const Personalization = lazy(() => import("./pages/personalization/personalization"));
const Accessories = lazy(() => import("./pages/Accessories/Accessories"));
const BuybackAll = lazy(() => import("./pages/buyback-all/buyback-all"));
const BuybackDetails = lazy(() => import("./pages/buyback-details/buyback-details"));
const Gifts = lazy(() => import("./pages/gifts/gifts"));
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
    { path: '/giftCard-Personalization', element: <GiftCardPersonalize /> },
    { path: '/gift-card-purchase', element: <GiftCardPurchase /> },
    { path: '/gifts-personalization', element: <GiftsPersonalization /> },
    { path: '/personalization', element: <Personalization /> },
    { path: '/faq', element: <FAQ /> },
    { path: '/privacy-policy', element: <PrivacyPolicy /> },
    { path: '/terms-conditions', element: <TermsConditions /> },
    { path: '/return-policy', element: <ReturnPolicy /> },
    {path:'/buyback/create',element:<Buyback3/>},
    {path:'/buyback3',element:<Buyback/>},
    {path:'/buyback-from-order',element:<BuybackFromOrder/>},
    {path:'/fabric-protection', element:<FabricProtection />},
    { path: '/career', element: <Careers /> },
    { path: '/career/:jobId', element: <CareerDetails /> },
    { path: '/career/applyNow/:jobId', element: <CareerApply /> },
    { path: '/careers', element: <Careers /> },
    { path: '/Accessories', element: <Accessories /> }
    ,    { path: '/buyback/all', element: <BuybackAll /> }
    ,{ path: '/buyback/details/:id', element: <BuybackDetails /> }
    ,{ path: '/gifts', element: <Gifts /> }
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
