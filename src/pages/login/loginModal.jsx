import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { sendOtp, verifyOtp, LoginUser, RegisterUser } from "../../service/login";
import * as localStorageService from "../../service/localStorageService";
import { LocalStorageKeys } from "../../constants/localStorageKeys";
import { message } from "../../comman/toster-message/ToastContainer";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/yobhaLogo.png";

const LoginModal = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [activeTab, setActiveTab] = useState("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // ⏱ Auto open modal after 10s if user not logged in
  useEffect(() => {
    const token = localStorageService.getValue(LocalStorageKeys.AuthToken);
    if (!token) {
      const timer = setTimeout(() => setShowModal(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { email, password };
      const response = await LoginUser(payload);
      const { token, refreshToken, user } = response.data;

      localStorageService.setValue(LocalStorageKeys.AuthToken, token);
      localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
      localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

      message.success("Welcome to YOBHA");
      setShowModal(false);
      const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
      localStorageService.removeValue("redirectAfterLogin");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = { fullName, email, password, phoneNumber };
      const response = await RegisterUser(payload);
      const { token, refreshToken, user } = response.data;

      localStorageService.setValue(LocalStorageKeys.AuthToken, token);
      localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
      localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

      message.success("Account created successfully!");
      setShowModal(false);
      const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/";
      localStorageService.removeValue("redirectAfterLogin");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      message.error(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  const handlePhoneContinue = async (e) => {
    e.preventDefault();
    try {
      await sendOtp(`${countryCode}${phoneNumber}`);
      setShowOtp(true);
      message.success("OTP sent successfully!");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleGoogleLogin = () => {
    const returnUrl = "http://localhost:3000/home";
    window.location.href = `https://backend.yobha.world/api/GoogleAuth/google/redirect?params=${encodeURIComponent(
      returnUrl
    )}`;
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 font-futura-pt-light">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200 p-8 relative transition-all font-futura-pt-light">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoImage} alt="YOBHA Logo" className="h-8 md:h-10" />
        </div>

        {/* Title */}
        <h2 className="text-base md:text-lg font-light text-center text-black mb-6 font-futura-pt-book">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {!showOtp ? (
          <>
            <form
              onSubmit={isSignup ? handleSignup : activeTab === "email" ? handleLogin : handlePhoneContinue}
              className="space-y-4"
            >
              {isSignup && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 text-sm font-futura-pt-light font-light"
                />
              )}

              {(!isSignup && activeTab === "email") || isSignup ? (
                <>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 text-sm font-futura-pt-light font-light"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 text-sm font-futura-pt-light font-light"
                  />
                </>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-20 px-2 py-3 border border-gray-300 focus:border-black focus:outline-none text-black text-sm font-futura-pt-light font-light"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="flex-1 px-3 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 text-sm"
                  />
                </div>
              )}

              {!isSignup && (
                <div className="flex justify-center gap-8 text-sm font-light text-black mt-2 font-futura-pt-light">
                  <button
                    type="button"
                    onClick={() => setActiveTab("email")}
                    className={`pb-1 font-futura-pt-light ${activeTab === "email" ? "border-b-2 border-black text-black" : "hover:text-black"}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("phone")}
                    className={`pb-1 font-futura-pt-light ${activeTab === "phone" ? "border-b-2 border-black text-black" : "hover:text-black"}`}
                  >
                    Phone
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-black text-white font-light hover:bg-gray-800 transition-colors text-sm mt-4 font-futura-pt-light"
              >
                {isSignup ? "Sign Up" : activeTab === "email" ? "Login" : "Continue"}
              </button>
            </form>

            {/* Divider */}
            {!isSignup && (
              <>
                <div className="flex items-center my-5 text-black">
                  <hr className="flex-grow border-gray-200" />
                  <span className="px-3 text-xs font-futura-pt-light font-light">Or</span>
                  <hr className="flex-grow border-gray-200" />
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 hover:border-black transition text-black font-light text-sm font-futura-pt-light"
                >
                  <FcGoogle size={20} /> Continue with Google
                </button>
              </>
            )}

            {/* Sign Up / Login Toggle */}
            <p className="text-center text-black mt-6 text-sm font-futura-pt-light font-light">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsSignup(false)}
                    className="text-black font-light cursor-pointer hover:text-black underline font-futura-pt-light"
                  >
                    Login
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span
                    onClick={() => setIsSignup(true)}
                    className="text-black font-light cursor-pointer hover:text-black underline font-futura-pt-light"
                  >
                    Sign Up
                  </span>
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-base md:text-lg font-light text-center text-black mb-3 font-futura-pt-book">
              Enter OTP
            </h2>
            <p className="text-center text-black mb-5 text-sm font-futura-pt-light font-light">
              Sent to {countryCode} {phoneNumber}
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 text-center text-lg font-light font-futura-pt-light focus:border-black focus:outline-none"
            />

            <button
              onClick={async () => {
                try {
                  const res = await verifyOtp(`${countryCode}${phoneNumber}`, otp);
                  const { token, refreshToken, user } = res?.data;

                  localStorageService.setValue(LocalStorageKeys.AuthToken, token);
                  localStorageService.setValue(LocalStorageKeys.RefreshToken, refreshToken);
                  localStorageService.setValue(LocalStorageKeys.User, JSON.stringify(user));

                  message.success("Login successful");
                  setShowOtp(false);
                  setShowModal(false);
                  const redirectTo = localStorageService.getValue("redirectAfterLogin") || "/home";
                  localStorageService.removeValue("redirectAfterLogin");
                  navigate(redirectTo, { replace: true });
                } catch {
                  message.error("OTP verification failed");
                }
              }}
              className="w-full mt-5 py-3 bg-black text-white font-light hover:bg-gray-800 transition-colors text-sm font-futura-pt-light"
            >
              Verify OTP
            </button>

            <button
              onClick={() => setShowOtp(false)}
              className="text-black hover:text-black text-sm mt-4 w-full text-center font-futura-pt-light font-light"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
