import React, { useEffect, useState } from "react";
import { Send, Gift, User, Mail, Phone, MapPin, Edit3, Save, X } from "lucide-react";
import { addAddress, updateAddress, deleteAddress, getAddresses, createReferral } from "../../service/address";
import { message } from "../../comman/toster-message/ToastContainer";
import { updateUserName } from "../../service/user";
import CountryDropdown from "../../countryDropdown";


const AccountPage = () => {
  const [userData, setUserData] = useState([]);
  const [LocalUserData, setLocalUserData] = useState({});
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
          // First parse to get the string
          const firstParse = JSON.parse(storedUser);

          // If it's still a string, parse again
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

  // Function to update localStorage with new user data
  const updateLocalStorage = (updatedData) => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      let parsedUser;
      try {
        // First parse to get the string
        const firstParse = JSON.parse(currentUser);

        // If it's still a string, parse again
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
        // Editing existing address - populate with saved address data
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

          // Update localStorage with the updated address
          updateLocalStorage({
            [`address_${editingAddressId}`]: tempData
          });
        } else {
          // Add new address
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
        // eslint-disable-next-line no-unused-vars
        const response = await updateUserName({ "fullName": tempData.name });
        message.success("Name Updated Successfully");

        // Update localStorage with new name
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
    }
    catch (err) {
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

    }
    catch (err) {
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
      // fallback: copy to clipboard
      navigator.clipboard.writeText(referralLink)
        .then(() => message.success("Referral link copied to clipboard!"))
        .catch(() => message.error("Failed to copy referral link"));
    }
  };
  // const handleCountryConfirmed = (country) => {
  //   // Save selected country in localStorage and state if needed
  //   updateLocalStorage({ country: country.label });
  //   message.success(`Country updated to ${country.label}`);
  // };

  return (
    <div
      className="min-h-screen bg-premium-cream pt-4 lg:pt-4 pb-12 font-sweet-sans"
    >
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 lg:py-12">

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <div className="border-b border-text-light/10 pb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 uppercase tracking-widest">
              My Account
            </h1>
            <p className="text-base sm:text-lg text-text-medium uppercase tracking-wider">
              Manage your profile and preferences
            </p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="space-y-6 lg:space-y-8">

          {/* First Row - Profile & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Profile Details */}
            <div className="bg-white border border-text-light/10 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="bg-white px-6 sm:px-8 py-6 border-b border-text-light/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-light text-gray-900 uppercase tracking-widest">
                    Profile Information
                  </h2>
                </div>
              </div>
              <div className="p-6 sm:p-8 space-y-6">

                {/* Name */}
                <div className="group">
                  <label className="text-xs font-semibold text-text-medium mb-3 block uppercase tracking-[0.2em]">Full Name</label>
                  {editingField === "name" ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={tempData.name || ""}
                        onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                        placeholder={LocalUserData.fullName || "Enter your full name"}
                        className="flex-1 px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white transition-colors font-medium"
                      />
                      <button
                        onClick={saveEdit}
                        disabled={savingName}
                        className="p-4 bg-black hover:bg-text-dark text-white transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {savingName ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save size={18} />
                        )}
                      </button>
                      <button onClick={cancelEdit} className="p-4 bg-text-light/10 hover:bg-text-light/20 text-black transition-all duration-200">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="group/item flex items-center justify-between p-5 bg-premium-beige border border-text-light/10 hover:border-text-light/20 transition-all duration-200">
                      <span className="text-black font-medium text-lg">
                        {LocalUserData.fullName || ""}
                      </span>
                      <button onClick={() => startEdit("name")} className="opacity-0 group-hover/item:opacity-100 text-black hover:text-text-medium transition-all duration-200 p-2 hover:bg-text-light/10">
                        <Edit3 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="text-xs font-semibold text-text-medium mb-3 block flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Mail size={14} />
                    Email Address
                  </label>
                  <div className="flex items-center justify-between p-5 bg-premium-beige border border-text-light/10">
                    <span className="text-black font-medium text-lg">
                      {LocalUserData.email || ""}
                    </span>
                    {/* {(LocalUserData.email ) && (
                      <span className="text-xs text-text-medium uppercase tracking-[0.2em] px-3 py-1 bg-black text-white">Verified</span>
                    )} */}
                  </div>
                </div>

                {/* Phone - Read Only */}
                <div>
                  <label className="text-xs font-semibold text-text-medium mb-3 block flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <div className="flex items-center justify-between p-5 bg-premium-beige border border-text-light/10">
                    <span className="text-black font-medium text-lg">
                      {LocalUserData.phone || LocalUserData.Phone || LocalUserData.phoneNumber || ""}
                    </span>
                    {(LocalUserData.phone || LocalUserData.Phone || LocalUserData.phoneNumber) && (
                      <span className="text-xs text-text-medium uppercase tracking-[0.2em] px-3 py-1 bg-black text-white">Verified</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Address Column */}
            <div className="bg-white border border-text-light/10 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="bg-white px-6 sm:px-8 py-6 border-b border-text-light/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-light text-gray-900 uppercase tracking-widest">
                    Addresses
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {editingField === "address" ? (
                  <div className="space-y-5">
                    <input
                      type="text"
                      placeholder={LocalUserData.fullName || LocalUserData.name || "Full Name"}
                      value={tempData.fullName || ""}
                      onChange={(e) => setTempData({ ...tempData, fullName: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={tempData.line1 || ""}
                      onChange={(e) => setTempData({ ...tempData, line1: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={tempData.line2 || ""}
                      onChange={(e) => setTempData({ ...tempData, line2: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                    />

                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={tempData.MobileNumnber || ""}
                      onChange={(e) => setTempData({ ...tempData, MobileNumnber: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={tempData.city || ""}
                        onChange={(e) => setTempData({ ...tempData, city: e.target.value })}
                        className="px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={tempData.state || ""}
                        onChange={(e) => setTempData({ ...tempData, state: e.target.value })}
                        className="px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={tempData.zip || ""}
                        onChange={(e) => setTempData({ ...tempData, zip: e.target.value })}
                        className="px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={tempData.country || ""}
                        onChange={(e) => setTempData({ ...tempData, country: e.target.value })}
                        className="px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white placeholder:text-text-light transition-colors font-medium"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={saveEdit}
                        disabled={savingAddress}
                        className="flex-1 bg-black hover:bg-text-dark text-white font-bold py-4 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {savingAddress ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            {editingAddressId ? "Update Address" : "Save Address"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={savingAddress}
                        className="px-8 bg-text-light/10 hover:bg-text-light/20 text-black font-semibold py-4 transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="group/item p-5 bg-premium-beige border border-text-light/10 relative hover:border-text-light/30 transition-all duration-200"
                          >
                            {/* Action Icons */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all duration-200">
                              <button
                                onClick={() => startEdit("address", addr.id)}
                                className="text-black hover:text-text-medium transition-all duration-200 p-2 hover:bg-text-light/10"
                                title="Edit Address"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-black hover:text-text-medium transition-all duration-200 p-2 hover:bg-text-light/10"
                                title="Delete Address"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="pr-20">
                              <p className="text-black font-semibold mb-2 text-lg">{addr.fullName}</p>
                              <p className="text-text-medium mb-1">
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p className="text-text-medium mb-1">
                                {addr.city}, {addr.state} - {addr.zip}
                              </p>
                              <p className="text-text-medium mt-1">
                                📞 {addr.mobileNumner || "No mobile number"}
                              </p>

                              <p className="text-text-medium">{addr.country}</p>
                            </div>
                          </div>

                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MapPin size={48} className="mx-auto text-text-light/40 mb-4" />
                          <p className="text-text-medium text-lg">No addresses found</p>
                          <p className="text-text-light text-sm mt-1">Add your first address to get started</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => startEdit("address")}
                      className="w-full bg-black hover:bg-text-dark text-white font-bold py-4 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider hover:scale-[1.02]"
                    >
                      <Edit3 size={18} />
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        <div className="mb-8 sm:mb-12 border-b border-text-light/10 pb-6 mt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3 uppercase tracking-widest">
            Refer & Earn
          </h1>
          <p className="text-base sm:text-lg text-text-medium uppercase tracking-wider">
            Invite your friends and earn exciting rewards
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-text-light/10 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-white px-6 sm:px-8 py-6 border-b border-text-light/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <Gift size={20} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black uppercase tracking-[0.15em]">
              Refer Your Friend
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">


            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-text-medium mb-3 block flex items-center gap-2 uppercase tracking-[0.2em]">
                <Mail size={14} /> Friend’s Email
              </label>
              <input
                type="email"
                name="friendEmail"
                value={formData.friendEmail}
                onChange={handleChange}
                placeholder="Enter your friend's email"
                className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white transition-colors font-medium"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-text-medium mb-3 block flex items-center gap-2 uppercase tracking-[0.2em]">
                <Phone size={14} /> Friend’s Phone Number
              </label>
              <input
                type="text"
                name="friendPhone"
                value={formData.friendPhone}
                onChange={handleChange}
                placeholder="Enter your friend's phone number"
                className="w-full px-5 py-4 border-2 border-text-light/20 focus:border-black focus:outline-none text-black bg-white transition-colors font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-black hover:bg-text-dark text-white font-bold py-4 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider hover:scale-[1.02] ${loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Invite"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex-1 bg-black hover:bg-text-dark text-white font-bold py-4 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider hover:scale-[1.02]"
              >
                Share
              </button>
            </div>

          </form>
        </div>
        {/* Country Selector */}
        <div className="mt-6">
          <label className="text-xs font-semibold text-text-medium mb-3 block flex items-center gap-2 uppercase tracking-[0.2em]">
            <MapPin size={14} />
            Country
          </label>
          <CountryDropdown />
        </div>

      </div>
    </div>
  );
};

export default AccountPage;

