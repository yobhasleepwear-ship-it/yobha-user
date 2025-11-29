// Simple cache for wishlist data to prevent multiple API calls
let wishlistCache = null;
let cacheTimestamp = null;
let pendingRequest = null;
const CACHE_DURATION = 30000; // 30 seconds cache

export const getCachedWishlist = async (getWishlistFn) => {
  const now = Date.now();
  
  // If we have a valid cache, return it
  if (wishlistCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return wishlistCache;
  }
  
  // If there's already a pending request, wait for it
  if (pendingRequest) {
    return pendingRequest;
  }
  
  // Make a new request and cache it
  pendingRequest = getWishlistFn()
    .then((response) => {
      wishlistCache = response;
      cacheTimestamp = now;
      pendingRequest = null;
      return response;
    })
    .catch((error) => {
      pendingRequest = null;
      throw error;
    });
  
  return pendingRequest;
};

export const invalidateWishlistCache = () => {
  wishlistCache = null;
  cacheTimestamp = null;
  pendingRequest = null;
};

export const getCachedWishlistData = () => {
  return wishlistCache;
};

