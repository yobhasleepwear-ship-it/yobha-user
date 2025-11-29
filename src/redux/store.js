import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import giftCardReducer from "./giftCardSlice";
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    giftCard: giftCardReducer,
    wishlist: wishlistReducer,
  },
});
