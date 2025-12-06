import * as axiosService from "./axiosService";


export const getFilteredProducts = async (payload) => {
  try {
    const response = await axiosService.Post("/Products/Query", payload);
    return response.data;
  } catch (err) {
    console.error("getFilteredProducts error:", err.response?.data || err.message);
    throw err;
  }
};


export const getProductDescription = async (id) => {
  try {
    const response = await axiosService.Get(`/Products/${id}`);
    return response.data;
  } catch (err) {
    console.error(
      "getProductDescription error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const submitReview = async (productId, reviewData) => {
  try {
    const response = await axiosService.Post(`/Products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (err) {
    console.error("submitReview error:", err.response?.data || err.message);
    throw err;
  }
};

export const getCartDetails = async () => {
  try {
    const response = await axiosService.Get(`/Cart`);
    return response.data;
  } catch (err) {
    console.error(
      "getCartDetails error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const addToCart = async (payload) => {
  try {
    const response = await axiosService.Post(`/Cart`, payload);
    return response.data;
  } catch (err) {
    console.error("addToCart error:", err.response?.data || err.message);
    throw err;
  }
};

export const updateCartQuantity = async (payload) => {
  try {
    const response = await axiosService.Patch(`/Cart/quantity`, payload);
    return response.data;
  } catch (err) {
    console.error("updateCartQuantity error:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteCartItem = async (id) => {
  try {
    const response = await axiosService.Delete(`/Cart/${id}`);
    return response.data;
  } catch (err) {
    console.error("deleteCartItem error:", err.response?.data || err.message);
    throw err;
  }
};