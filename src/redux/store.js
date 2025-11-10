import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import giftCardReducer from "./giftCardSlice";
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    giftCard: giftCardReducer,

  },
});
