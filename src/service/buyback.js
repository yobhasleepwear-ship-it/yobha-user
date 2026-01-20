import * as axiosService from "./axiosService";

export const createBuyback = async (data) => {
  try {
    const response = await axiosService.Post("/buyback/create", data);
    return response.data;
  } catch (error) {
    console.error("createBuyback error:", error);
    throw error;
  }
};

export const getBuybackDetails = async ()=>{
    try{
        const response = await axiosService.Get("/buyback/getBuyBackDetails")
        return response
    }
    catch(err){
        console.error(err)
    }
}
export const createBuybackPayment = async (buybackId) => {
  try {
    const response = await axiosService.Post(`/buyback/pay/${buybackId}`);
    return response.data;
  } catch (error) {
    console.error("createBuybackPayment error:", error);
    throw error;
  }
};

export const getPaymentStatusUpdated = async (payload) => {
  try {
    const response = await axiosService.Post("/Admin/ChangeOrderStatus", payload);
    return response.data;
  } catch (error) {
    console.error("createBuyback error:", error);
    throw error;
  }
};
