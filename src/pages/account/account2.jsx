import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Gift, User, Mail, Phone, MapPin, Edit3, X, CheckCircle, Package, ChevronRight, Gift as GiftIcon } from "lucide-react";
import { addAddress, updateAddress, deleteAddress, getAddresses, createReferral } from "../../service/address";
import { message } from "../../comman/toster-message/ToastContainer";
import { updateUserName } from "../../service/user";
import { getOrders } from "../../service/order";
import CountryDropdown from "../../countryDropdown";

const AccountPage2 = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [LocalUserData, setLocalUserData] = useState({});
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempData, setTempData] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    friendEmail: "",
    friendPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingName, setSavingName] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        let parsedUser;
        try {
          const firstParse = JSON.parse(storedUser);
          if (typeof firstParse === 'string') {
            parsedUser = JSON.parse(firstParse);
          } else {
            parsedUser = firstParse;
          }
        } catch (error) {
          parsedUser = {};
        }
        setLocalUserData(parsedUser);
      }
    };

    loadUserData();
    GetAddress();
    fetchOrders();

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        console.log("localStorage changed, reloading user data");
        loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await getOrders();
      setOrders(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price, cur) =>
    `${cur}${Number(price || 0).toLocaleString("en-IN")}`;

  // Function to update localStorage with new user data
  const updateLocalStorage = (updatedData) => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      let parsedUser;
      try {
        const firstParse = JSON.parse(currentUser);
        if (typeof firstParse === 'string') {
          parsedUser = JSON.parse(firstParse);
        } else {
          parsedUser = firstParse;
        }
      } catch (error) {
        console.error("Failed to parse localStorage user data in updateLocalStorage:", error);
        parsedUser = {};
      }
      const updatedUser = { ...parsedUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setLocalUserData(updatedUser);
    }
  };

  const startEdit = (field, addressId = null) => {
    setEditingField(field);
    if (field === "address") {
      if (addressId) {
        const addressToEdit = userData.find(addr => addr.id === addressId);
        if (addressToEdit) {
          setEditingAddressId(addressId);
          setTempData({
            fullName: addressToEdit.fullName || "",
            line1: addressToEdit.line1 || "",
            line2: addressToEdit.line2 || "",
            city: addressToEdit.city || "",
            state: addressToEdit.state || "",
            zip: addressToEdit.zip || "",
            country: addressToEdit.country || "",
            MobileNumnber: addressToEdit.mobileNumner || "",
            isDefault: addressToEdit.isDefault || false
          });
        }
      } else {
        setEditingAddressId(null);
        setTempData({
          fullName: LocalUserData.fullName || LocalUserData.name || "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          MobileNumnber: '',
          isDefault: false
        });
      }
    } else if (field === "name") {
      const currentName = LocalUserData.fullName || LocalUserData.name || LocalUserData.Name || LocalUserData.FullName || "";
      setTempData({ name: currentName });
    }
  };

  const saveEdit = async () => {
    if (editingField === "address") {
      setSavingAddress(true);
      try {
        if (editingAddressId) {
          await updateAddress(editingAddressId, tempData);
          message.success("Address Updated Successfully");
          updateLocalStorage({
            [`address_${editingAddressId}`]: tempData
          });
        } else {
          const payload = { ...tempData };
          await addAddress(payload);
          message.success("Address Saved Successfully");
        }
        GetAddress();
      } catch (error) {
        console.error("Failed to save address:", error);
        message.error("Failed to save address");
      } finally {
        setSavingAddress(false);
      }
    } else if (editingField === "name") {
      setSavingName(true);
      try {
        const response = await updateUserName({ "fullName": tempData.name });
        message.success("Name Updated Successfully");
        updateLocalStorage({
          name: tempData.name,
          fullName: tempData.name
        });
      } catch (error) {
        console.error("Failed to update name:", error);
        message.error("Failed to update name");
      } finally {
        setSavingName(false);
      }
    }
    setEditingField(null);
    setTempData({});
  };

  const GetAddress = async () => {
    try {
      const response = await getAddresses();
      setUserData(response.data)
    } catch (err) {
      console.log("something went wrong")
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: formData.friendEmail,
        phone: formData.friendPhone,
      };
      await createReferral(payload);
      message.success("Referral Sent Successfully!");
      setFormData({ friendEmail: "", friendPhone: "" });
    } catch (err) {
      console.error(err);
      message.error("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      message.success("Address Deleted Successfully")
      GetAddress();
    } catch (err) {
      message.error("something went wrong")
    }
  }

  const cancelEdit = () => {
    setEditingField(null);
    setTempData({});
    setEditingAddressId(null);
  };

  const handleShare = () => {
    const referralLink = `${window.location.origin}/signup`;
    if (navigator.share) {
      navigator.share({
        title: "Join me on YOBHA",
        text: "Sign up using my referral link and earn rewards!",
        url: referralLink,
      })
        .then(() => console.log("success"))
        .catch((err) => console.error(err));
    } else {
      navigator.clipboard.writeText(referralLink)
        .then(() => message.success("Referral link copied to clipboard!"))
        .catch(() => message.error("Failed to copy referral link"));
    }
  };

  return (
    <div className="min-h-screen bg-white font-futura-pt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
            My Account
          </h1>
          <div className="w-12 md:w-16 h-px bg-gray-300 mb-4 md:mb-5" />
          <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light">
            Manage your profile and preferences
          </p>
        </div>

        {/* Vertical Layout */}
        <div className="space-y-6 md:space-y-8">
          {/* Profile Details */}
          <div className="bg-white border border-gray-200">
              <div className="px-6 md:px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-600" />
                  <h2 className="text-lg sm:text-xl md:text-xl font-light text-black uppercase font-futura-pt-light">
                    Profile Information
                  </h2>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                {/* Name */}
                <div>
                  <label className="text-xs uppercase text-gray-500 font-light mb-3 block">
                    Full Name
                  </label>
                  {editingField === "name" ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={tempData.name || ""}
                        onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                        placeholder={LocalUserData.fullName || "Enter your full name"}
                        className="flex-1 px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white font-light placeholder:text-gray-400 text-sm md:text-base"
                      />
                      <button
                        onClick={saveEdit}
                        disabled={savingName}
                        className="px-4 py-3 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingName ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-3 border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="group/item flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                      <span className="text-black font-light text-base md:text-lg">
                        {LocalUserData.fullName || ""}
                      </span>
                      <button
                        onClick={() => startEdit("name")}
                        className="opacity-0 group-hover/item:opacity-100 text-gray-600 hover:text-black transition-opacity p-2 hover:bg-gray-100"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="text-xs uppercase text-gray-500 font-light mb-3 block flex items-center gap-2">
                    <Mail size={14} />
                    Email Address
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 min-h-[56px]">
                    <span className="text-black font-light text-base md:text-lg">
                      {LocalUserData.email || ""}
                    </span>
                  </div>
                </div>

                {/* Phone - Read Only */}
                <div>
                  <label className="text-xs uppercase text-gray-500 font-light mb-3 block flex items-center gap-2">
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                    <span className="text-black font-light text-base md:text-lg">
                      {LocalUserData.phone || LocalUserData.Phone || LocalUserData.phoneNumber || ""}
                    </span>
                    {(LocalUserData.phone || LocalUserData.Phone || LocalUserData.phoneNumber) && (
                      <span className="text-xs uppercase px-2 py-1 bg-gray-100 text-gray-600 font-light border border-gray-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* Address Section */}
          <div className="bg-white border border-gray-200">
              <div className="px-6 md:px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-gray-600" />
                  <h2 className="text-lg sm:text-xl md:text-xl font-light text-black uppercase font-futura-pt-light">
                    Addresses
                  </h2>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {editingField === "address" ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={LocalUserData.fullName || LocalUserData.name || "Full Name"}
                      value={tempData.fullName || ""}
                      onChange={(e) => setTempData({ ...tempData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={tempData.line1 || ""}
                      onChange={(e) => setTempData({ ...tempData, line1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={tempData.line2 || ""}
                      onChange={(e) => setTempData({ ...tempData, line2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                    />
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={tempData.MobileNumnber || ""}
                      onChange={(e) => setTempData({ ...tempData, MobileNumnber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={tempData.city || ""}
                        onChange={(e) => setTempData({ ...tempData, city: e.target.value })}
                        className="px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={tempData.state || ""}
                        onChange={(e) => setTempData({ ...tempData, state: e.target.value })}
                        className="px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={tempData.zip || ""}
                        onChange={(e) => setTempData({ ...tempData, zip: e.target.value })}
                        className="px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={tempData.country || ""}
                        onChange={(e) => setTempData({ ...tempData, country: e.target.value })}
                        className="px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white placeholder:text-gray-400 font-light text-sm md:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={saveEdit}
                        disabled={savingAddress}
                        className="flex-1 px-6 py-3 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingAddress ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            {editingAddressId ? "Update Address" : "Save Address"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={savingAddress}
                        className="px-6 py-3 border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors text-xs uppercase font-light disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4 mb-6">
                      {userData && userData.length > 0 ? (
                        userData.map((addr) => (
                          <div
                            key={addr.id}
                            className="group/item p-5 bg-gray-50 border border-gray-200 relative"
                          >
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit("address", addr.id)}
                                className="text-gray-600 hover:text-black transition-colors p-2 hover:bg-gray-100"
                                title="Edit Address"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-gray-600 hover:text-black transition-colors p-2 hover:bg-gray-100"
                                title="Delete Address"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="pr-16 sm:pr-20">
                              <p className="text-black font-light mb-2 text-base md:text-lg">{addr.fullName}</p>
                              <p className="text-gray-600 font-light mb-1 text-sm">
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p className="text-gray-600 font-light mb-1 text-sm">
                                {addr.city}, {addr.state} - {addr.zip}
                              </p>
                              <p className="text-gray-600 font-light mt-1 text-sm">
                                {addr.mobileNumner || "No mobile number"}
                              </p>
                              <p className="text-gray-600 font-light text-sm">{addr.country}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-600 text-base font-light">No addresses found</p>
                          <p className="text-gray-500 text-sm font-light mt-1">Add your first address to get started</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => startEdit("address")}
                      className="w-full px-6 py-3.5 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 size={16} />
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

          {/* My Orders Section */}
          <div className="bg-white border border-gray-200">
            <div className="px-6 md:px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-gray-600" />
                  <h2 className="text-lg sm:text-xl md:text-xl font-light text-black uppercase font-futura-pt-light">
                    My Orders
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              {isLoadingOrders ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm font-light">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-sm font-light">No orders yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {orders.slice(0, 3).map((order) => {
                      const isGiftCard = order?.giftCardNumber;
                      const firstItem = order?.items?.[0] || {};
                      const imgSrc =
                        firstItem?.thumbnailUrl ||
                        firstItem?.image ||
                        firstItem?.productImage ||
                        firstItem?.imageUrl ||
                        null;

                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer"
                          onClick={() => navigate(`/order-details/${order.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            {isGiftCard ? (
                              <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <GiftIcon className="text-black" size={20} strokeWidth={1.5} />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={firstItem?.productName || "Product"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="text-black" size={20} strokeWidth={1.5} />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-light text-gray-500 mb-1">
                                Order ID: {order.id || order.orderNo}
                              </p>
                              <p className="text-sm font-light text-black mb-1 truncate">
                                {isGiftCard
                                  ? "Gift Card Purchase"
                                  : firstItem?.productName || "Product Order"}
                              </p>
                              <p className="text-xs font-light text-gray-600">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <ChevronRight className="text-gray-400 flex-shrink-0" size={16} strokeWidth={1.5} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {orders.length > 3 && (
                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full px-4 py-2 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      View All
                      <ChevronRight size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Refer & Earn Section */}
          <div className="mt-8 md:mt-12">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-2xl font-light text-black uppercase mb-2 font-futura-pt-light">
                Refer & Earn
              </h2>
              <p className="text-gray-600 text-sm md:text-base font-light">
                Invite your friends and earn exciting rewards
              </p>
            </div>

            {/* Referral Card */}
            <div className="bg-white border border-gray-200">
              <div className="px-6 md:px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Gift size={20} className="text-gray-600" />
                  <h3 className="text-lg sm:text-xl md:text-xl font-light text-black uppercase font-futura-pt-light">
                    Refer Your Friend
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {/* Email */}
                <div>
                  <label className="text-xs uppercase text-gray-500 font-light mb-3 block flex items-center gap-2">
                    <Mail size={14} /> Friend's Email
                  </label>
                  <input
                    type="email"
                    name="friendEmail"
                    value={formData.friendEmail}
                    onChange={handleChange}
                    placeholder="Enter your friend's email"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white font-light placeholder:text-gray-400 text-sm md:text-base"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs uppercase text-gray-500 font-light mb-3 block flex items-center gap-2">
                    <Phone size={14} /> Friend's Phone Number
                  </label>
                  <input
                    type="text"
                    name="friendPhone"
                    value={formData.friendPhone}
                    onChange={handleChange}
                    placeholder="Enter your friend's phone number"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black bg-white font-light placeholder:text-gray-400 text-sm md:text-base"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 px-6 py-3.5 border border-black text-black text-xs uppercase font-light hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    Share
                  </button>
                </div>
              </form>
            </div>

            {/* Country Selector */}
            <div className="mt-6">
              <label className="text-xs uppercase text-gray-500 font-light mb-3 block flex items-center gap-2">
                <MapPin size={14} />
                Country
              </label>
              <CountryDropdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage2;

