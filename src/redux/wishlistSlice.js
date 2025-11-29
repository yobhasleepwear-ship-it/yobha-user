import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0, 
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistCount: (state, action) => {
      state.count = action.payload;
    },
    incrementWishlistCount: (state) => {
      state.count += 1;
    },
    decrementWishlistCount: (state) => {
      state.count = Math.max(0, state.count - 1);
    },
  },
});

export const { setWishlistCount, incrementWishlistCount, decrementWishlistCount } = wishlistSlice.actions;
export default wishlistSlice.reducer;

