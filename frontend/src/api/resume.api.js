import api from "../utils/axios";

export const getResume = async () => {
  try {
    const response = await api.get("/api/resume/get-resume");

    return response.data;
  } catch (error) {
    console.log("Failed to fetch resume:", error);
    return null;
  }
};

export const updateResume = async (resumeData) => {
  try {
    const response = await api.patch("/api/resume/update", resumeData);

    return response.data;
  } catch (error) {
    console.log("Failed to update resume:", error);
    return null;
  }
};
