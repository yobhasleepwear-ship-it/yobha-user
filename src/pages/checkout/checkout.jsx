import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Banknote, Truck, RotateCcw, Shield, ChevronDown, Pencil, Tag, Star, Gift } from "lucide-react";
import { getAddresses, addAddress, updateAddress } from "../../service/address";
import { getCartDetails } from "../../service/productAPI";
import { CreateOrder } from "../../service/order";
import { message } from "../../comman/toster-message/ToastContainer";
import { getCoupons } from "../../service/coupans";
import { createOrder, updatePayment } from "../../service/orderService";
import { removeKey } from "../../service/localStorageService";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { pageProps } = useParams();
  const location = useLocation();
  const { checkoutProd, selectedCountry, selectedSize, quantity } = location.state || {};
  console.log(checkoutProd, selectedCountry, selectedSize, quantity, "product")
  const navigate = useNavigate();

  // Address State
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    landmark: '',
  });
  console.log(address, "add")
  const [addressErrors, setAddressErrors] = useState({});
  const [userAddresses, setUserAddresses] = useState([]);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Payment State
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Order & Cart State
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  console.log(cartItems, "cartItems")
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    distinctItems: 0,
    subTotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0,
    currency: ""
  });
  console.log(cartSummary, "carts")
  // Coupons & Loyalty State
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState({});
  console.log(selectedCoupon, selectedPayment)
  const [isCouponsExpanded, setIsCouponsExpanded] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [loyaltyDiscountAmount, setLoyaltyDiscountAmount] = useState(0);
  const [ShippingRemarks, setShippingRemarks] = useState('')
  // Terms & Gift Wrap State
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [giftWrapEnabled, setGiftWrapEnabled] = useState(false);
  const [email, setEmail] = useState("")
  const [giftCardNumber, setGiftCardNumber] = useState("")
  // Payment Methods
  const paymentMethods = [
    {
      id: "razorpay",
      name: "Prepaid",
      icon: CreditCard,
      description: "Pay online via card or UPI"
    },
    {
      id: "COD",
      name: "Cash on Delivery",
      icon: Banknote,
      description: "Pay when you receive"
    },
  ];

  // Fetch coupons function
  const fetchCoupons = useCallback(async (Subtotal) => {
    try {
      setIsLoadingCoupons(true);
      const response = await getCoupons(Subtotal);

      if (response.success) {
        // Updated to use the correct API response structure
        console.log("Coupons API Response:", response.data);
        setAvailableCoupons(response.data.coupons || []);
        setLoyaltyPoints(response.data.loyaltyPoints || 0);

        // Calculate loyalty discount amount (loyalty points / 10)
        const loyaltyDiscount = Math.floor((response.data.loyaltyPoints || 0) / 10);
        setLoyaltyDiscountAmount(loyaltyDiscount);
      }
    } catch (err) {
      console.log("Failed to fetch coupons:", err);
      message.error("Failed to load available coupons");
    } finally {
      setIsLoadingCoupons(false);
    }
  }, [cartSummary.subTotal]);

  // Fetch addresses and cart
  useEffect(() => {
    fetchAddresses();


    if (checkoutProd && checkoutProd.length > 0 || pageProps == 'buynow') {
      const items = checkoutProd.items || []
      console.log(items, "items")
      setCartItems(items)
      const subTotal = items.reduce((sum, item) => {
        const product = item || {};

        // If lineTotal is already calculated (from buyNow), use it directly
        // if (item.lineTotal && typeof item.lineTotal === 'number') {
        //   return sum + item.lineTotal;
        // }

        // Otherwise, calculate from priceList or unitPrice
        const priceList = product?.priceList || [];
        const matchingPrice = priceList.find(price =>
          price.country === (item.country || product.country) &&
          price.size === (item.size || product.size)
        );

        // Try multiple fallback options
        const unitPrice = matchingPrice?.priceAmount

        return sum + (unitPrice * (item.quantity || 1));
      }, 0);
      console.log(subTotal, "55")
      fetchCoupons(subTotal)

      let totalShipping = 0;
      items.forEach(item => {
        const countryPrice = item?.product?.countryPrice;
        if (countryPrice && countryPrice.priceAmount !== undefined) {
          totalShipping += countryPrice.priceAmount;
        }
      });

      const discount = 0;
      const tax = 0;
      const grandTotal = subTotal + totalShipping + tax - discount;

      setCartSummary({
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        distinctItems: items.length,
        subTotal,
        shipping: totalShipping,
        tax,
        discount,
        grandTotal,
        // currency: items.priceList((e)=>e.country===items.country && e.size===items.size).currency
        currency: 'INR'
      });
    } else {
      fetchCart();
    }
  }, [checkoutProd]);



  const handleOrder = async () => {
    console.log(selectedCoupon && selectedCoupon.code ? selectedCoupon.code : "", "kkk")
    try {
      const PurchasedProduct = cartItems.map((item, index) => ({
        id: item.id,
        size: item.size,
        quantity: item.quantity,
        fabric: item.fabricType,
        color: item.color,
        monogram: item.monogram
      }));
      const orderPayload = {
        currency: cartItems[0].priceList.find((e) => e.country === cartItems[0].country).currency,
        productRequests: PurchasedProduct,
        shippingAddress: {
          FullName: address.fullName,
          Line1: address.line1,
          AddressLine2: address.line2,
          City: address.city,
          State: address.state,
          Zip: address.zip,
          Country: address.country,
          MobileNumner: address.mobileNumner
        },
        ShippingRemarks: ShippingRemarks,
        paymentMethod: selectedPayment ? selectedPayment.id : "",
        couponCode: selectedCoupon && selectedCoupon.code ? selectedCoupon.code : "",
        couponDiscount: calculateCouponDiscount(selectedCoupon)?? "",
        loyaltyDiscountAmount: loyaltyDiscountAmount ?? 0,
        email: email,
        orderCountry: cartItems.country,
        giftCardNumber: giftCardNumber
      };

      // this payload is of gift card purchase 
      const giftCardPurchase = {
        "currency": "INR",
        "productRequests": [],
        "shippingAddress": null,
        "paymentMethod": "razorpay",
        "giftCardAmount": 1001.00,
        "email": "buyer@example.com",
        "orderCountry": "IN"
      }


      const orderRes = await createOrder(orderPayload);
      if (!orderRes.success) {
        message.error("Order creation failed ❌");
        return;
      }
      if (orderRes.razorpayOrderId == null) {
        message.success("Order Created Successfully , your orderId is " + orderPayload.orderId)
        removeKey("cart");
        setCartItems([])
        return
      }


      const options = {
        key: "rzp_test_Rb7lQAPEkEa2Aw",
        amount: orderRes.total * 100,
        currency: cartItems[0].priceList.find((e) => e.country === cartItems[0].country).currency,
        order_id: orderRes.razorpayOrderId,
        prefill: { email: orderPayload.email },
        handler: async (response) => {
          const updateRes = await updatePayment({
            razorpayOrderId: orderRes.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            isSuccess: true,
          });

          message.success("Payment successful ✅");
          removeKey("cart");
          setCartItems([])
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("handleTestOrder error:", error);
      message.error("Something went wrong ❌");
    }
  };


  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      const addresses = response.data || [];
      setUserAddresses(addresses);

      // If addresses exist, use the first one by default
      if (addresses.length > 0) {
        setAddress(addresses[0]);
        setUseSavedAddress(true);
      } else {
        // If no addresses exist, set to manual entry mode
        setUseSavedAddress(false);
      }
    } catch (err) {
      console.log("Failed to fetch addresses");
      // If API fails, default to manual entry
      setUseSavedAddress(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await JSON.parse(localStorage.getItem("cart")) || [];
      const items = response || [];
      setCartItems(items)
      const subTotal = items.reduce((sum, item) => {
        const product = item || {};

        // If lineTotal is already calculated (from buyNow), use it directly
        // if (item.lineTotal && typeof item.lineTotal === 'number') {
        //   return sum + item.lineTotal;
        // }

        // Otherwise, calculate from priceList or unitPrice
        const priceList = product?.priceList || [];
        const matchingPrice = priceList.find(price =>
          price.country === (item.country || product.country) &&
          price.size === (item.size || product.size)
        );

        // Try multiple fallback options
        const unitPrice = matchingPrice?.priceAmount

        return sum + (unitPrice * (item.quantity || 1));
      }, 0);
      console.log(subTotal, "55")
      fetchCoupons(subTotal)

      let totalShipping = 0;
      items.forEach(item => {
        const countryPrice = item?.product?.countryPrice;
        if (countryPrice && countryPrice.priceAmount !== undefined) {
          totalShipping += countryPrice.priceAmount;
        }
      });

      const discount = 0;
      const tax = 0;
      const grandTotal = subTotal + totalShipping + tax - discount;

      setCartSummary({
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        distinctItems: items.length,
        subTotal,
        shipping: totalShipping,
        tax,
        discount,
        grandTotal,
        // currency: items.priceList((e)=>e.country===items.country && e.size===items.size).currency
        currency: 'INR'
      });
    } catch (err) {
      console.log(err || "Failed to fetch cart");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddAddress = async () => {
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const errors = {};

    requiredFields.forEach(field => {
      if (!address[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      setIsAddingAddress(true);

      // Map form fields to API expected fields
      const addressPayload = {
        fullName: address.fullName,
        MobileNumnber: address.phone,
        line1: address.addressLine1,
        line2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        zip: address.pincode,
        country: address.country,
        isDefault: false
      };

      // Log the address object being sent
      console.log("Sending address data:", addressPayload);

      const response = await addAddress(addressPayload);

      console.log("Add address response:", response);

      if (response.success) {
        message.success("Address added successfully!");
        // Refresh addresses list
        await fetchAddresses();
        // Switch to saved address mode and select the new address
        setUseSavedAddress(true);
        setAddress(response.data);
      }
    } catch (err) {
      console.error("Failed to add address - Full error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      message.error(`Failed to add address: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleEditAddress = (addressToEdit) => {
    setIsEditingAddress(true);
    setEditingAddressId(addressToEdit.id);
    setAddress({
      fullName: addressToEdit.fullName,
      phone: addressToEdit.phone,
      addressLine1: addressToEdit.line1,
      addressLine2: addressToEdit.line2 || '',
      city: addressToEdit.city,
      state: addressToEdit.state,
      pincode: addressToEdit.zip,
      country: addressToEdit.country,
      landmark: addressToEdit.landmark || ''
    });
    setUseSavedAddress(false);
  };

  const handleUpdateAddress = async () => {
    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const errors = {};

    requiredFields.forEach(field => {
      if (!address[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      setIsAddingAddress(true);

      // Map form fields to API expected fields
      const addressPayload = {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.addressLine1,
        line2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        zip: address.pincode,
        country: address.country,
        landmark: address.landmark || ''
      };

      const response = await updateAddress(editingAddressId, addressPayload);

      if (response.success) {
        message.success("Address updated successfully!");
        // Refresh addresses list
        await fetchAddresses();
        // Reset edit state
        setIsEditingAddress(false);
        setEditingAddressId(null);
        // Switch to saved address mode and select the updated address
        setUseSavedAddress(true);
        setAddress(response.data);
      }
    } catch (err) {
      console.error("Failed to update address:", err);
      message.error(`Failed to update address: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddress({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      landmark: '',
    });
    setAddressErrors({});
  };


  const handlePlaceOrder = () => {
    // const errors = validateAddress(address);
    // if (Object.keys(errors).length > 0) {
    //   setAddressErrors(errors);
    //   message.error("please provide correct address")
    //   return;
    // }
    if (!selectedPayment) {
      message.error("Please select a payment method");
      return;
    }

    if (!acceptedTerms) {
      message.error("Please accept the Terms and Conditions to place your order");
      return;
    }

    // console.log(user,"user")
    // const userId = user.id || "anonymous";
    // console.log(userId)
    const payload = {
      "couponCode": selectedCoupon ? selectedCoupon.code : null,
      "loyaltyDiscountAmount": loyaltyDiscountAmount,
      "paymentMethod": selectedPayment ? selectedPayment.id.toUpperCase() : "COD",
      "shippingAddress": {
        "fullName": address.fullName || "Samrat Sarotra",
        "line1": address.addressLine1 || "Flat 302, Yuhanns Empire",
        "line2": address.addressLine2 || "Murugeshpalya",
        "city": address.city || "Bangalore",
        "state": address.state || "Karnataka",
        "zip": address.pincode || "560017",
        "country": address.country || "India",
        "isDefault": true
      }
    };


    console.log("Order Payload:", payload);


    setIsProcessing(true);
    try {
      const response = CreateOrder(payload)
      console.log(response);
      message.success("Order Created SuccessFully");
      // navigate("/orders")

    }
    catch (err) {
      console.log(err)
      message.error("Please Try Again")
    }
    finally {
      setIsProcessing(false)
    }
  };

  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon);
    message.success(`Coupon "${coupon.code}" applied successfully!`);
  }

  const handleCouponRemove = () => {
    setSelectedCoupon({});
    message.info("Coupon removed");
  }

  const calculateCouponDiscount = (coupon) => {
    if (!coupon) return 0;

    let discount = 0;

    if (coupon.type === 0) {
      // Percentage discount
      discount = (cartSummary.subTotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else if (coupon.type === 1) {
      // Fixed amount discount
      discount = coupon.value;
    }

    return Math.floor(discount);
  }

  const calculateTotalDiscount = () => {
    let totalDiscount = 0;

    if (selectedCoupon) {
      totalDiscount += calculateCouponDiscount(selectedCoupon);
    }

    if (loyaltyDiscountAmount > 0) {
      totalDiscount += loyaltyDiscountAmount;
    }

    return totalDiscount;
  }

  const getValidCoupons = () => {
    return availableCoupons.filter(coupon =>
      coupon.isActive &&
      cartSummary.subTotal >= coupon.minOrderAmount
    );
  }

  // Get gift wrap amount based on country
  const getGiftWrapAmount = (country) => {
    // Currently returns 5 for all countries, can be extended later
    const giftWrapPrices = {
      'India': 5,
      'United Arab Emirates (UAE)': 5,
      'Saudi Arabia': 5,
      'Qatar': 5,
      'Kuwait': 5,
      'Oman': 5,
      'Bahrain': 5,
      'Jordan': 5,
      'Lebanon': 5,
      'Egypt': 5,
      'Iraq': 5,
    };
    return giftWrapPrices[country] || 5;
  };

  // Calculate gift wrap amount
  const calculateGiftWrapAmount = () => {
    if (!giftWrapEnabled) return 0;
    const country = address.country || 'India';
    return getGiftWrapAmount(country);
  };

  // Get currency from cart items (assuming all items have the same currency)
  const getCurrency = () => {
    if (!cartItems || cartItems.length === 0) return 'INR';
    const firstItem = cartItems[0];
    return firstItem?.product?.currency || 'INR';
  };

  // Format price based on currency - same as product description page
  const formatPrice = (price, currency) => {
    if (typeof price !== 'number') return '0';

    return price.toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="min-h-screen bg-premium-cream font-sweet-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-12">

        {/* Back Button & Header */}
        <div className="mb-8 md:mb-12">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-text-medium hover:text-black mb-4 transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
            <span className="text-sm uppercase tracking-wider">Back to Cart</span>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-black uppercase tracking-widest mb-2">
            Checkout
          </h1>
          <p className="text-text-medium font-light text-sm md:text-base">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white border border-text-light/20">
              <div
                className="px-4 md:px-6 py-4 md:py-5 border-b border-text-light/20 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
              >
                <h2 className="text-base md:text-lg font-semibold text-black uppercase tracking-wider flex items-center gap-2 font-sweet-sans">
                  <MapPin size={20} strokeWidth={1.5} />
                  Delivery Address
                </h2>
                <ChevronDown
                  size={20}
                  className={`text-text-medium transition-transform duration-200 ${isDeliveryExpanded ? 'rotate-180' : ''
                    }`}
                  strokeWidth={1.5}
                />
              </div>

              {isDeliveryExpanded && (
                <div className="p-4 md:p-6">
                  {/* Radio Button Toggle - Only show when addresses exist */}
                  {userAddresses.length > 0 && (
                    <div className="mb-6 pb-4 border-b border-text-light/20">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            checked={useSavedAddress}
                            onChange={() => setUseSavedAddress(true)}
                            className="accent-black"
                          />
                          <span className="font-light">Use Saved Address</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            checked={!useSavedAddress}
                            onChange={() => setUseSavedAddress(false)}
                            className="accent-black"
                          />
                          <span className="font-light">Enter Manually</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Address Content */}
                  {userAddresses.length > 0 && useSavedAddress ? (
                    <div className="space-y-3">
                      {userAddresses.map((addr, index) => (
                        <div
                          key={addr.id}
                          className={`p-4 border-2  cursor-pointer transition-all ${address.id === addr.id
                            ? 'border-black bg-premium-beige'
                            : 'border-text-light/20 hover:border-text-dark bg-white'
                            }`}
                          onClick={() => setAddress(addr)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="radio"
                                  checked={address.id === addr.id}
                                  onChange={() => setAddress(addr)}
                                  className="accent-black"
                                />
                                <h3 className="font-light text-black text-sm md:text-base font-sweet-sans">
                                  {addr.fullName}
                                </h3>
                              </div>
                              <div className="text-xs md:text-sm text-text-medium space-y-1 ml-6">
                                <p>{addr.line1}</p>
                                {addr.line2 && <p>{addr.line2}</p>}
                                <p>{addr.city}, {addr.state} - {addr.zip}</p>
                                <p>{addr.country}</p>
                                {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              className="ml-3 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1"
                            >
                              <Pencil size={12} strokeWidth={1.5} />
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Form Header */}
                      {isEditingAddress && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 ">
                          <p className="text-sm text-blue-800 font-light">Editing Address</p>
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Cancel Edit
                          </button>
                        </div>
                      )}

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-light text-gray-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={address.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm transition-colors ${addressErrors.fullName
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.fullName && <p className="text-xs text-red-500 mt-1">{addressErrors.fullName}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-light text-gray-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={address.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm transition-colors ${addressErrors.phone
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.phone && <p className="text-xs text-red-500 mt-1">{addressErrors.phone}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-light text-gray-700 mb-1">Address Line 1 *</label>
                          <input
                            type="text"
                            name="addressLine1"
                            value={address.addressLine1}
                            onChange={handleInputChange}
                            placeholder="Street address, building, house number"
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm transition-colors ${addressErrors.addressLine1
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.addressLine1 && <p className="text-xs text-red-500 mt-1">{addressErrors.addressLine1}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-light text-gray-700 mb-1">Address Line 2</label>
                          <input
                            type="text"
                            name="addressLine2"
                            value={address.addressLine2}
                            onChange={handleInputChange}
                            placeholder="Apartment, suite, unit, etc. (Optional)"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none text-sm  transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm  transition-colors ${addressErrors.city
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.city && <p className="text-xs text-red-500 mt-1">{addressErrors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleInputChange}
                            placeholder="Enter state"
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm  transition-colors ${addressErrors.state
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.state && <p className="text-xs text-red-500 mt-1">{addressErrors.state}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-1">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={address.pincode}
                            onChange={handleInputChange}
                            placeholder="Enter pincode"
                            maxLength={6}
                            className={`w-full px-4 py-3 border-2 focus:outline-none text-sm  transition-colors ${addressErrors.pincode
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 focus:border-black hover:border-gray-400'
                              }`}
                          />
                          {addressErrors.pincode && <p className="text-xs text-red-500 mt-1">{addressErrors.pincode}</p>}
                        </div>

                        {/* <div>
                          <label className="block text-sm font-light text-gray-700 mb-1">Landmark</label>
                          <input
                            type="text"
                            name="landmark"
                            value={address.landmark}
                            onChange={handleInputChange}
                            placeholder="Nearby landmark (Optional)"
                            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none text-sm  transition-colors"
                          />
                        </div> */}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Show when no addresses exist OR when in manual entry mode */}
                  {(userAddresses.length === 0 || !useSavedAddress) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={isEditingAddress ? handleUpdateAddress : handleAddAddress}
                          disabled={isAddingAddress}
                          className="flex-1 bg-black text-white py-3 px-6 font-light hover:bg-gray-800 transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed "
                        >
                          {isAddingAddress ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>{isEditingAddress ? 'Updating...' : 'Adding...'}</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={16} strokeWidth={1.5} />
                              {isEditingAddress ? 'Update Address' : 'Add Address'}
                            </>
                          )}
                        </button>

                        {isEditingAddress && (
                          <button
                            onClick={handleCancelEdit}
                            disabled={isAddingAddress}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-light hover:bg-gray-50 transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed "
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Coupons & Loyalty Section */}
            <div className="bg-white border border-text-light/20">
              <div
                className="px-4 md:px-6 py-4 md:py-5 border-b border-text-light/20 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsCouponsExpanded(!isCouponsExpanded)}
              >
                <h2 className="text-base md:text-lg font-semibold text-black uppercase tracking-wider flex items-center gap-2 font-sweet-sans">
                  <Gift size={20} strokeWidth={1.5} />
                  Coupons & Loyalty Points
                </h2>
                <ChevronDown
                  size={20}
                  className={`text-text-medium transition-transform duration-200 ${isCouponsExpanded ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                />
              </div>

              {isCouponsExpanded && (
                <div className="p-4 md:p-6 space-y-6">
                  {/* Loyalty Points Section */}
                  {loyaltyPoints > 0 && (
                    <div className="bg-gradient-to-r from-luxury-gold/10 to-luxury-rose-gold/10 border border-luxury-gold/20 p-4 md:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star size={20} className="text-luxury-gold" strokeWidth={1.5} />
                          <h3 className="text-sm md:text-base font-light text-black uppercase tracking-wider font-sweet-sans">
                            Loyalty Points
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs md:text-sm text-text-medium">Available Points</p>
                          <p className="text-lg md:text-xl font-light text-luxury-gold">{loyaltyPoints}</p>
                        </div>
                      </div>
                      <div className="bg-white/50 border border-luxury-gold/20 p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs md:text-sm font-light text-black">Redeemable Amount</p>
                            <p className="text-xs text-text-medium">Convert {loyaltyPoints} points to discount</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm md:text-base font-light text-luxury-rose-gold">
                              {formatPrice(loyaltyDiscountAmount, getCurrency())}
                            </p>
                            <p className="text-xs text-text-medium">({loyaltyDiscountAmount * 10} points used)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coupons Section */}
                  <div>
                    <h3 className="text-sm md:text-base font-light text-black uppercase tracking-wider mb-4 flex items-center gap-2 font-sweet-sans">
                      <Tag size={18} strokeWidth={1.5} />
                      Available Coupons
                    </h3>

                    {isLoadingCoupons ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-text-medium">Loading coupons...</span>
                      </div>
                    ) : getValidCoupons().length > 0 ? (
                      <div className="space-y-3">
                        {getValidCoupons().map((coupon) => (
                          <div
                            key={coupon.id}
                            className={`p-4 border-2 cursor-pointer transition-all ${selectedCoupon?.id === coupon.id
                              ? 'border-gray-700 bg-gray-100'
                              : 'border-text-light/20 hover:border-black bg-white'
                              }`}
                            onClick={() => handleCouponSelect(coupon)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <input
                                    type="radio"
                                    checked={selectedCoupon?.id === coupon.id}
                                    onChange={() => handleCouponSelect(coupon)}
                                    className="accent-black"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm md:text-base font-light text-black uppercase tracking-wider">
                                      {coupon.code}
                                    </span>
                                    {coupon.firstOrderOnly && (
                                      <span className="px-2 py-1 text-xs bg-gray-200 text-white rounded-full font-light">
                                        First Order
                                      </span>
                                    )}
                                    {coupon.first100UsersOnly && (
                                      <span className="px-2 py-1 text-xs bg-gray-200 text-white rounded-full font-light">
                                        Limited
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs md:text-sm text-text-medium ml-6 mb-2">
                                  {coupon.description}
                                </p>
                                <div className="flex items-center gap-4 ml-6">
                                  <div className="text-sm font-light text-luxury-rose-gold">
                                    Save {formatPrice(calculateCouponDiscount(coupon), getCurrency())}
                                  </div>
                                  {coupon.isActive && cartSummary.subTotal >= coupon.minOrderAmount && (
                                    <span className="text-xs text-green-600 font-light">✓ Valid for your order</span>
                                  )}
                                  {cartSummary.subTotal < coupon.minOrderAmount && (
                                    <span className="text-xs text-orange-600 font-light">Min order ₹{coupon.minOrderAmount}</span>
                                  )}
                                </div>
                              </div>
                              {selectedCoupon?.id === coupon.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCouponRemove();
                                  }}
                                  className="ml-3 px-3 py-1 text-xs bg-gray-700 text-white hover:bg-gray-700 transition-colors rounded"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Gift size={48} className="text-text-light mx-auto mb-3" strokeWidth={1} />
                        <p className="text-sm text-text-medium">
                          {availableCoupons.length === 0
                            ? "No coupons available for this order"
                            : `No valid coupons for orders under ₹${Math.min(...availableCoupons.map(c => c.minOrderAmount))}`
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Applied Discounts Summary */}
                  {calculateTotalDiscount() > 0 && (
                    <div className="bg-gray-50 border border-gray-700 p-4 md:p-5">
                      <h4 className="text-sm font-light text-black uppercase tracking-wider mb-3 font-sweet-sans">
                        Applied Discounts
                      </h4>
                      <div className="space-y-2">
                        {selectedCoupon && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-medium">Coupon: {selectedCoupon.code}</span>
                            <span className="text-luxury-rose-gold font-light">
                              -{formatPrice(calculateCouponDiscount(selectedCoupon), getCurrency())}
                            </span>
                          </div>
                        )}
                        {loyaltyDiscountAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-medium">Loyalty Points ({loyaltyDiscountAmount * 10} pts used)</span>
                            <span className="text-luxury-gold font-light">
                              -{formatPrice(loyaltyDiscountAmount, getCurrency())}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-luxury-gold/20 pt-2 mt-3">
                          <div className="flex justify-between text-sm font-light">
                            <span className="text-black">Total Discount</span>
                            <span className="text-luxury-rose-gold">
                              -{formatPrice(calculateTotalDiscount(), getCurrency())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-text-light/20">
              <div className="px-4 md:px-6 py-4 md:py-5 border-b border-text-light/20">
                <h2 className="text-base md:text-lg font-semibold text-black uppercase tracking-wider flex items-center gap-2 font-sweet-sans">
                  <CreditCard size={20} strokeWidth={1.5} />
                  Payment Method
                </h2>
                <p className="text-xs md:text-sm font-light text-text-medium mt-1">
                  Choose your payment option
                </p>
              </div>
              <div className="p-4 md:p-6 space-y-3">
                {paymentMethods.map(method => {
                  const IconComponent = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`block p-4 border-2 cursor-pointer transition-all ${selectedPayment?.id === method.id ? "border-black bg-premium-beige" : "border-text-light/20 hover:border-text-dark bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment?.id === method.id}
                        onChange={() => setSelectedPayment(method)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${selectedPayment?.id === method.id ? "bg-black text-white" : "bg-premium-beige text-black"}`}>
                          <IconComponent size={22} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className=" font-semibold text-black text-sm md:text-base">{method.name}</span>
                          </div>
                          <p className="text-xs md:text-sm font-light mt-1">{method.description}</p>
                        </div>
                        {selectedPayment?.id === method.id && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 border-2 border-black bg-black flex items-center justify-center">
                              <div className="w-2 h-2 bg-white"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Contact & Delivery Notes */}
            <div className="bg-white border border-text-light/20">
              <div className="px-4 md:px-6 py-4 md:py-5 border-b border-text-light/20">
                <h2 className="text-base md:text-lg font-semibold text-black uppercase tracking-wider flex items-center gap-2 font-sweet-sans">
                  <Shield size={18} strokeWidth={1.5} />
                  Order Contact & Notes
                </h2>
                <p className="text-xs md:text-sm font-light text-text-medium mt-1">
                  Keep us posted with your preferred email and delivery notes
                </p>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-light text-gray-700 mb-2 uppercase tracking-[0.25em]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for order updates"
                      className="w-full border border-text-light/20  bg-gray-50/60 px-4 py-3 text-sm md:text-base text-black/80 placeholder:text-black/40 focus:outline-none focus:border-black focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-light text-gray-700 mb-2 uppercase tracking-[0.25em]">
                    Shipping Remarks
                  </label>
                  <textarea
                    value={ShippingRemarks}
                    onChange={(e) => setShippingRemarks(e.target.value)}
                    placeholder="Add any special delivery instructions..."
                    className="w-full border border-text-light/20 bg-gray-50/60 px-4 py-3 text-sm md:text-base text-black/80 placeholder:text-black/40 focus:outline-none focus:border-black focus:bg-white transition-all duration-200"
                    rows={4}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-text-light/20 lg:sticky lg:top-24">
              <div className="p-4 md:p-6 border-b border-text-light/20">
                <h2 className="text-base md:text-lg font-semibold text-black uppercase tracking-wider mb-1 font-sweet-sans">
                  Order Summary
                </h2>
                {/* <p className="text-xs md:text-sm text-text-medium">{cartSummary.distinctItems} {cartSummary.distinctItems === 1 ? 'item' : 'items'}</p> */}
              </div>

              <div className="p-4 md:p-6 space-y-3">
                {cartItems.map(item => {

                  const product = item || {};
                  const priceList = product?.priceList || [];
                  const matchingPrice = priceList.find(price =>
                    price.country === product.country &&
                    price.size === product.size
                  );
                  const unitPrice = matchingPrice?.priceAmount ?? product?.unitPrice ?? 0;
                  const currency = matchingPrice?.currency ?? getCurrency();
                  const itemTotal = unitPrice * (item.quantity || 0);
                  const imageSrc = item?.images?.[0]?.thumbnailUrl || item?.images?.[0]?.url || product?.images?.[0]?.thumbnailUrl || product?.images?.[0]?.url || item?.thumbnailUrl || product?.thumbnailUrl || "https://via.placeholder.com/64";
                  const monogramText = (item?.monogram || product?.monogram || "").trim();

                  return (
                    <div key={`${item.id}_${item.size || "nosize"}`} className="flex items-center gap-3 border-b border-text-light/10 pb-3">
                      <img src={imageSrc} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-light text-black truncate">{product.name}</p>
                        {item.size && (
                          <p className="text-xs uppercase tracking-widest text-text-medium">Size • <span className="text-black tracking-normal">{item.size}</span></p>
                        )}
                        <p className="text-xs text-text-medium">{item.quantity} × {formatPrice(unitPrice, currency)}</p>
                        {monogramText && (
                          <div className="inline-flex items-center gap-2  border border-luxury-gold/30 bg-luxury-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-luxury-gold">

                            <span className="font-light tracking-[0.2em] text-black text-[11px]">{monogramText}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-light text-black whitespace-nowrap">{formatPrice(itemTotal, currency)}</div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-text-light/20 space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-text-medium">Subtotal</span>
                    <span className="text-black font-light">{formatPrice(cartSummary.subTotal, getCurrency())}</span>
                  </div>

                  {/* Coupon Discount */}
                  {selectedCoupon && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-text-medium">Coupon: {selectedCoupon.code}</span>
                      <span className="text-luxury-rose-gold font-light">-{formatPrice(calculateCouponDiscount(selectedCoupon), getCurrency())}</span>
                    </div>
                  )}

                  {/* Loyalty Points Discount */}
                  {loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-text-medium">Loyalty Points ({loyaltyDiscountAmount * 10} pts used)</span>
                      <span className="text-luxury-gold font-light">-{formatPrice(loyaltyDiscountAmount, getCurrency())}</span>
                    </div>
                  )}

                  {/* Total Discount */}
                  {calculateTotalDiscount() > 0 && (
                    <div className="flex justify-between text-xs md:text-sm border-t border-text-light/10 pt-2">
                      <span className="text-text-medium font-light">Total Discount</span>
                      <span className="text-luxury-rose-gold font-light">-{formatPrice(calculateTotalDiscount(), getCurrency())}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-text-medium">Shipping</span>
                    {cartSummary.shipping === 0 ? (
                      <span className="text-black font-light">FREE</span>
                    ) : (
                      <span className="text-black font-light">{formatPrice(cartSummary.shipping, getCurrency())}</span>
                    )}
                  </div>
                  {cartSummary.tax > 0 && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-text-medium">Tax</span>
                      <span className="text-black font-light">{formatPrice(cartSummary.tax, getCurrency())}</span>
                    </div>
                  )}
                </div>

                {/* Gift Wrap Amount */}
                {giftWrapEnabled && (
                  <div className="flex justify-between text-xs md:text-sm pt-2 border-t border-text-light/10">
                    <span className="text-text-medium">Gift Wrap</span>
                    <span className="text-black font-light">{formatPrice(calculateGiftWrapAmount(), getCurrency())}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 pb-4 md:pb-6 border-t border-text-light/20">
                  <span className="text-base md:text-lg font-light text-black uppercase tracking-wider font-sweet-sans">Total</span>
                  <span className="text-xl md:text-2xl font-light text-black font-sweet-sans">{formatPrice(cartSummary.subTotal - calculateTotalDiscount() + cartSummary.shipping + cartSummary.tax + calculateGiftWrapAmount(), getCurrency())}
                    <p className="text-sm">(inc. all taxes)</p>
                  </span>
                </div>

                {cartSummary.shipping === 0 && (
                  <div className="space-y-3 py-4 border-b border-text-light/20">
                    <div className="flex items-start gap-3">
                      <Truck size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-light text-black">Free Shipping</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw size={16} className="text-text-medium mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-light text-black">Easy Returns</p>
                        <p className="text-xs text-text-medium">30-day return policy</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gift Wrap Checkbox */}
                <div className="mt-6 pt-4 border-t border-text-light/20">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={giftWrapEnabled}
                      onChange={(e) => setGiftWrapEnabled(e.target.checked)}
                      className="mt-1 w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0 text-black cursor-pointer accent-black"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Gift size={16} className="text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm md:text-base font-light text-black">Add Gift Wrap</span>
                        <span className="text-xs md:text-sm text-text-medium">
                          ({formatPrice(getGiftWrapAmount(address.country || 'India'), getCurrency())})
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-text-medium mt-1 ml-6">
                        Add premium gift wrapping to make your order special
                      </p>
                    </div>
                  </label>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mt-4 pt-4 border-t border-text-light/20">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0 text-black cursor-pointer accent-black"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs md:text-sm text-text-medium">
                        I accept the{" "}
                        <button
                          type="button"
                          className="text-black underline hover:text-gray-700 font-light bg-transparent border-0 p-0 cursor-pointer"
                          onClick={(e) => {
                            navigate('/terms-conditions');
                          }}
                        >
                          Terms and Conditions
                        </button>
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isProcessing || !acceptedTerms}
                  className="w-full bg-black text-white py-3 md:py-4 font-light hover:bg-text-dark transition-colors uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={18} strokeWidth={1.5} />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                <div className="mt-6 pt-4 border-t border-text-light/10">
                  <div className="flex items-center gap-2 text-xs text-text-medium justify-center">
                    <Shield size={14} strokeWidth={1.5} />
                    <span>100% Secure Payment</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
