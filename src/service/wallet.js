import * as axiosService from "./axiosService";


export const getLoyaltyAudit = async (page = 1, pageSize = 20) => {
  try {
    const response = await axiosService.Get("/Auth/loyalty-audit", {
      page,
      pageSize,
    });
    return response.data;
  } catch (error) {
    console.error("getLoyaltyAudit error:", error);
    throw error;
  }
};

