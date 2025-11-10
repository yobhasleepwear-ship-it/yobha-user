// store/giftCardSlice.js
import { createSlice } from "@reduxjs/toolkit";

const giftCardSlice = createSlice({
  name: "giftCard",
  initialState: {
    email: "",
    giftCardAmount: "",
    currency: "INR",
    orderCountry: "IN",
  },
  reducers: {
    setGiftCardData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearGiftCardData: () => ({
      email: "",
      giftCardAmount: "",
      currency: "INR",
      orderCountry: "IN",
    }),
  },
});

export const { setGiftCardData, clearGiftCardData } = giftCardSlice.actions;
export default giftCardSlice.reducer;
