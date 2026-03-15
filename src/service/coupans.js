import * as axiosService from "./axiosService";

export const getCoupons = async (orderAmount) => {
  try {
    const response = await axiosService.Get(
      `/coupons/active-for-me?orderAmount=${orderAmount}`
    );
    return response.data;
  } catch (error) {
    console.error("getCoupons error:", error);
    throw error;
  }
};
