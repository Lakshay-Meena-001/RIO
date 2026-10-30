import api from "../../utils/axios";

export const getResume = async () => {
  const response = await api.get("/api/resumes/get-resume");
  return response.data;
};

// Fetch every active resume belonging to the current user.
export const getResumes = async () => {
  const response = await api.get("/api/resumes");
  return response.data;
};

// Scorer uses a separate server-filtered endpoint: builder-created resumes
// must never appear as paid analysis reports.
export const getScoredResumes = async () => {
  const response = await api.get("/api/resumes/scored");
  return response.data;
};

export const getScoredResumeById = async (resumeId) => {
  if (!resumeId) throw new Error("Scored resume ID is required.");
  const response = await api.get(
    `/api/resumes/scored/${encodeURIComponent(resumeId)}`,
  );
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

export const createResume = async (resumeData) => {
  const response = await api.post("/api/resumes/create", resumeData);
  return response.data;
};

export const updateResume = async (resumeData) => {
  const response = await api.patch("/api/resumes/update", resumeData);
  return response.data;
};

export const deleteResume = async (resumeId) => {
  const response = await api.delete(
    `/api/resumes/${encodeURIComponent(resumeId)}`,
  );
  return response.data;
};

// Scorer reports have a dedicated delete endpoint so Builder actions cannot remove them.
export const deleteScoredResume = async (resumeId) => {
  if (!resumeId) throw new Error("Scored resume ID is required.");
  const response = await api.delete(
    `/api/resumes/scored/${encodeURIComponent(resumeId)}`,
  );
  return response.data;
};
