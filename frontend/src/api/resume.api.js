import api from "../utils/axios";

export const getResume = async () => {
  try {
    const response = await api.get("/api/resumes/get-resume");

    return response.data;
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    throw error;
  }
};

export const updateResume = async (resumeData) => {
  try {
    const response = await api.patch("/api/resumes/update", resumeData);

    return response.data;
  } catch (error) {
    console.error("Failed to update resume:", error);
    throw error;
  }
};
