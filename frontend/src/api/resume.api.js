import api from "../utils/axios";

export const getResume = async () => {
  try {
    const response = await api.get("/api/resume/get-resume");

    return response.data;
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    throw error;
  }
};

export const updateResume = async (resumeData) => {
  try {
    const response = await api.patch("/api/resume/update", resumeData);

    return response.data;
  } catch (error) {
    console.error("Failed to update resume:", error);
    throw error;
  }
};

export const useCoins = async (data) => {
  try {
    const response = await api.post("/api/auth/user-coins", data);

    return response.data;
  } catch (error) {
    console.error("Failed to use coins:", error);
    throw error;
  }
};
