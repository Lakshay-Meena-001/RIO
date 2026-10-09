import api from "../utils/axios";

export const getResume = async () => {
  const response = await api.get("/api/resumes/get-resume");
  return response.data;
};

// Fetch every active resume belonging to the current user.
export const getResumes = async () => {
  const response = await api.get("/api/resumes");
  return response.data;
};

// Fetch one resume by its stable MongoDB ID.
export const getResumeById = async (resumeId) => {
  if (!resumeId) {
    throw new Error("Resume ID is required.");
  }

  const response = await api.get(
    `/api/resumes/${encodeURIComponent(resumeId)}`,
  );

  return response.data;
};

export const updateResume = async (resumeData) => {
  const response = await api.patch("/api/resumes/update", resumeData);
  return response.data;
};
