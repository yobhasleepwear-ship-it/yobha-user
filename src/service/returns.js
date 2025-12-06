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

export const getReturns = async (page = 1, pageSize = 25) => {
  try {
    const response = await axiosService.Get("/returns/me", { page, pageSize });
    return response.data;
  } catch (error) {
    console.error("getReturns error:", error);
    throw error;
  }
};

export const updateReturn = async (returnId, data) => {
  try {
    const response = await axiosService.Put(`/returns/${returnId}`, data);
    return response.data;
  } catch (error) {
    console.error("updateReturn error:", error);
    throw error;
  }
};

export const cancelReturn = async (returnId) => {
  try {
    const response = await axiosService.Delete(`/returns/${returnId}`);
    return response.data;
  } catch (error) {
    console.error("cancelReturn error:", error);
    throw error;
  }
};

