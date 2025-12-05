import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import { LoginUser, RegisterUser, sendOtp, verifyOtp } from "../../service/login";
import HeaderWithSidebar from "../../comman/app-header/app-header2";
import Footer from "../../comman/footer/footer";
import logoImage from "../../assets/yobhaLogo.png"
import * as localStorageService from "../../service/localStorageService";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import { Link, useNavigate } from "react-router-dom";
import { message } from "../../comman/toster-message/ToastContainer";
import { addToWishlist } from "../../service/wishlist";
import { invalidateWishlistCache } from "../../service/wishlistCache";
import { useDispatch } from "react-redux";
import { incrementWishlistCount } from "../../redux/wishlistSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("phone");
  const [isSignup, setIsSignup] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");

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


  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = { fullName, email, password, phoneNumber };
      const response = await RegisterUser(payload); // call signup API

      console.log("Signup successful:", response);

      const { token, refreshToken, user } = response.data;
      console.log(token, "token")

      localStorageService.setValue(LocalStorageKeys.AuthToken, token);
      localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
      localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

      message.success("Account created successfully! Welcome to YOBHA");
      
      // Execute pending wishlist action if any
      await executePendingWishlistAction();
      
      const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
      localStorageService.removeValue("redirectAfterLogin");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);
      message.error("Signup failed. Try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { email, password };
      const response = await LoginUser(payload);
      console.log("Login successful:", response);


      const { token, refreshToken, user } = response.data;


      localStorageService.setValue(LocalStorageKeys.AuthToken, token);
      localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
      localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

      message.success("Login successful! Welcome to YOBHA");
      
      // Execute pending wishlist action if any
      await executePendingWishlistAction();
      
      const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
      localStorageService.removeValue("redirectAfterLogin");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      message.error(err.response?.data?.message || "Login failed. Try again.");
    }
  };
  const handlePhoneContinue = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      try {
        await sendOtp(`${countryCode}${phoneNumber}`);
        setShowOtpModal(true);
        message.success("OTP sent successfully!");
      } catch (err) {
        console.error("Send OTP failed:", err);
        message.error(err.response?.data?.message || "Failed to send OTP");
      }
    } else {
      message.error("Please enter phone number");
    }
  };
  const handleGoogleLogin = () => {

    const returnUrl = localStorageService.getValue("redirectAfterLogin") || "/home";
    window.location.href = `https://backend.yobha.world/api/GoogleAuth/google/redirect?params=${encodeURIComponent(returnUrl)}`;
  };


  return (
    <>
      <HeaderWithSidebar />
  <div className="relative min-h-screen flex flex-col md:flex-row bg-white pt-14 font-futura-pt-light">
        {/* Close button placed inside page content so it appears below header */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Close login"
          className="absolute top-6 right-4 md:top-10 md:right-6 z-[1100] w-10 h-10 md:w-11 md:h-11 flex items-center justify-center  bg-white border border-text-light/20 shadow hover:bg-gray-50"
        >
          <span className="text-lg md:text-xl font-light font-futura-pt-light">✕</span>
        </button>
        {/* Left Side - Brand Section */}
        <div className="hidden md:flex w-1/2 p-16 lg:p-20 bg-gray-200 flex-col justify-center items-start space-y-8 bg-white">
          <h1 className="text-xl sm:text-md md:text-lg lg:text-xl font-light text-black font-futura-pt-book">
            Welcome
          </h1>
          <p className="font-light max-w-md text-sm md:text-base leading-relaxed text-black font-futura-pt-light">
            Discover the ultimate luxury in sleepwear with YOBHA. Sign in to continue and indulge in exclusivity.
          </p>
          <div className="flex space-x-6 text-black text-2xl font-futura-pt-light">
            <button className="hover:text-black transition-colors font-futura-pt-light" aria-label="Instagram">
              <FaInstagram />
            </button>
            <button className="hover:text-black transition-colors font-futura-pt-light" aria-label="Facebook">
              <FaFacebookF />
            </button>
            <button className="hover:text-black transition-colors font-futura-pt-light" aria-label="Twitter">
              <FaTwitter />
            </button>
          </div>
        </div>

        {/* Right Side - Login/Signup Form */}
        <div className="flex w-full md:w-1/2 justify-center items-center p-6 md:p-12 lg:p-20">
          <div className="w-full md:max-w-md bg-white border border-text-light/20 shadow-lg p-8 md:p-12 font-futura-pt-light">
            {/* Brand */}
            <div className="flex justify-center items-center mb-10 md:mb-12">
              <Link to="/" className="flex items-center">
                <img
                  src={logoImage}
                  alt="YOBHA Logo"
                  className="h-8 md:h-10"
                />
              </Link>
            </div>


            {!isSignup ? (
              <>
                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-8 md:mb-10 border-b border-text-light/20">
                  <button
                    onClick={() => setActiveTab("email")}
                    className={`pb-3 px-2 font-light text-sm transition-all font-futura-pt-light ${activeTab === "email"
                      ? "border-b-2 border-black text-black"
                      : "text-black hover:text-black"
                      }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setActiveTab("phone")}
                    className={`pb-3 px-2 font-light text-sm transition-all font-futura-pt-light ${activeTab === "phone"
                      ? "border-b-2 border-black text-black"
                      : "text-black hover:text-black"
                      }`}
                  >
                    Phone
                  </button>
                </div>

                {/* Login Form */}
                <form className="space-y-5" onSubmit={activeTab === "phone" ? handlePhoneContinue : handleLogin}>
                  {activeTab === "email" ? (
                    <>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm font-futura-pt-light font-light"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm font-futura-pt-light font-light"
                      />
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 sm:w-24 px-2 sm:px-3 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white text-xs sm:text-sm font-light font-futura-pt-light cursor-pointer"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+84">🇻🇳 +84</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+94">🇱🇰 +94</option>
                        <option value="+977">🇳🇵 +977</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="flex-1 min-w-0 px-3 sm:px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm font-futura-pt-light font-light"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-black text-white font-light hover:bg-text-dark transition-colors text-sm mt-6 font-futura-pt-light"
                  >
                    {activeTab === "email" ? "Login" : "Continue"}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center my-6 md:my-8 text-black">
                  <hr className="flex-grow border-text-light/20" />
                  <span className="px-4 text-xs font-futura-pt-light font-light">Or</span>
                  <hr className="flex-grow border-text-light/20" />
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-text-light/30 hover:border-black transition-colors text-black font-light text-sm font-futura-pt-light"
                >
                  <FcGoogle size={22} />
                  Continue with Google
                </button>

                {/* Signup Link */}
                <p className="text-center text-black mt-6 md:mt-8 text-sm font-futura-pt-light font-light">
                  New to YOBHA?{" "}
                  <span
                    onClick={() => setIsSignup(true)}
                    className="text-black font-light cursor-pointer hover:text-black transition-colors underline font-futura-pt-light"
                  >
                    Sign Up
                  </span>
                </p>
              </>
            ) : (
              <>
                {/* Signup Form */}
                <h2 className="text-center text-base md:text-lg font-light text-black mb-6 md:mb-8 font-futura-pt-book">
                  Create Account
                </h2>
                <form className="space-y-5" onSubmit={handleSignup}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-20 sm:w-24 px-2 sm:px-3 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white text-xs sm:text-sm font-light font-futura-pt-light cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+7">🇷🇺 +7</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+20">🇪🇬 +20</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+62">🇮🇩 +62</option>
                      <option value="+63">🇵🇭 +63</option>
                      <option value="+66">🇹🇭 +66</option>
                      <option value="+84">🇻🇳 +84</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+94">🇱🇰 +94</option>
                      <option value="+977">🇳🇵 +977</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="flex-1 min-w-0 px-3 sm:px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-black text-white font-light hover:bg-text-dark transition-colors text-sm mt-6 font-futura-pt-light"
                  >
                    Sign Up
                  </button>
                </form>
                <p className="text-center text-black mt-6 md:mt-8 text-sm font-futura-pt-light font-light">
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsSignup(false)}
                    className="text-black font-light cursor-pointer hover:text-black transition-colors underline font-futura-pt-light"
                  >
                    Login
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white p-6 md:p-8 w-full max-w-md shadow-2xl border border-text-light/20">
              <h2 className="text-base md:text-lg font-light text-black mb-3 md:mb-4 text-center font-futura-pt-book">
                Enter OTP
              </h2>
              <p className="text-center text-black mb-6 text-sm md:text-base font-futura-pt-light font-light">
                We sent a verification code to
              </p>

              {/* Phone Number Display */}
              <div className="bg-premium-beige p-3 mb-6 text-center border border-text-light/20">
                <p className="text-black font-light text-base md:text-lg break-all font-futura-pt-light">
                  {countryCode} {phoneNumber}
                </p>
              </div>

              {/* OTP Input */}
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="w-full px-4 py-4 border-2 border-text-light/30 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light mb-5 text-center text-lg md:text-xl font-light font-futura-pt-light"
              />
              <button
                className="w-full py-4 bg-black text-white font-light hover:bg-text-dark transition-colors text-sm font-futura-pt-light"
                onClick={async () => {
                  try {
                    const response = await verifyOtp(`${countryCode}${phoneNumber}`, otp);
                    console.log("OTP verified:", response);

                    // Save tokens if returned
                    const { token, refreshToken, user } = response?.data;
                    localStorageService.setValue(LocalStorageKeys.AuthToken, token);
                    localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
                    localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

                    message.success("Login successful! Welcome to YOBHA");
                    setShowOtpModal(false);
                    
                    // Execute pending wishlist action if any
                    await executePendingWishlistAction();
                    
                    const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
                    localStorageService.removeValue("redirectAfterLogin");
                    navigate(redirectTo, { replace: true });
                  } catch (err) {
                    console.error("OTP verification failed:", err);
                    message.error(err.response?.data?.message || "OTP verification failed");
                  }
                }}
              >
                Verify OTP
              </button>

              {/* Resend OTP */}
              <p className="text-center text-black mt-4 text-sm font-futura-pt-light font-light">
                Didn't receive code?{" "}
                <button
                  onClick={async () => {
                    try {
                      await sendOtp(`${countryCode}${phoneNumber}`);
                      message.success("OTP resent successfully!");
                    } catch (error) {
                      console.error("Resend OTP error:", error);
                      message.error("Failed to resend OTP");
                    }
                  }}
                  className="text-black font-light hover:text-black transition-colors underline font-futura-pt-light"
                >
                  Resend OTP
                </button>
              </p>

              <button
                className="text-center text-black mt-3 cursor-pointer hover:text-black text-sm w-full transition-colors font-futura-pt-light font-light"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
