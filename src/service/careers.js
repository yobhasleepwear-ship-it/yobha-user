import * as axiosService from "./axiosService";

export const getAllJobs = async () => {
  try {
    const response = await axiosService.Get("/careers");
    return response.data;
  } catch (err) {
    console.error("getAllJobs error:", err.response?.data || err.message);
    throw err;
  }
};

export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await axiosService.Post(`/careers/${jobId}/apply`, applicationData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    console.error("applyForJob error:", err.response?.data || err.message);
    throw err;
  }
}; 