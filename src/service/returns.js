import * as axiosService from "./axiosService";

export const createReturn = async (data) => {
  try {
    const response = await axiosService.Post("/returns/create", data);
    return response.data;
  } catch (error) {
    console.error("createReturn error:", error);
    throw error;
  }
};

