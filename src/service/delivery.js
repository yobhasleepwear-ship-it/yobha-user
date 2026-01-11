import axios from "axios";

// Replace with your actual token
const DELHIVERY_TOKEN = "5e4dadacd6a2f52a891d608f37c9738d4f95f394";

export const getPinCodeDetails = async (pinCode) => {
  try {
    const response = await axios.get(
      `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pinCode}`,
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

// Usage example
// (async () => {
//   const details = await getPinCodeDetails("560017");
//   console.log(details);
// })();
