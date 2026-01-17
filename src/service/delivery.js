import * as axiosService from "./axiosService";

// Replace with your actual token
const DELHIVERY_TOKEN = "5e4dadacd6a2f52a891d608f37c9738d4f95f394";

export const getPinCodeDetails = async (pinCode) => {
  try {
    const response = await axiosService.Get(
      `/Delivery/pincode/${pinCode}`,
      {
        headers: {
          Authorization: `Token ${DELHIVERY_TOKEN}`,
          "Content-Type": "application/json",

        },
      }
    );

    return response.data; // Return the API response JSON
  } catch (err) {
    console.error(
      "Fetching pin code details failed:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const TrackOrder = async (waybillNumber) => {
  try {
    const response = await axiosService.Get(
      `/Delivery/track/${waybillNumber}`
    );
    return response.data;
  } catch (error) {
    console.error("TrackOrder error:", error);
    throw error;
  }
};



// Usage example
// (async () => {
//   const details = await getPinCodeDetails("560017");
//   console.log(details);
// })();
