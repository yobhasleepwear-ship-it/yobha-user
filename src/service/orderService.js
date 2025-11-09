import * as axiosService from "./axiosService";

// ✅ 1. Create Order (Gift Card / Product / Gift Card + Product)
export const createOrder = async (data) => {
  try {
    const response = await axiosService.Post("/orders", data);
    return response.data;
  } catch (error) {
    console.error("createOrder error:", error);
    throw error;
  }
};

// ✅ 2. Update Payment (After Razorpay success/failure)
export const updatePayment = async (data) => {
  try {
    const response = await axiosService.Post("/orders/update-payment", data);
    return response.data;
  } catch (error) {
    console.error("updatePayment error:", error);
    throw error;
  }
};
