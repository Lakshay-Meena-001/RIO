import api from "../utils/axios.js";

// Fetch the currently authenticated user from the API Gateway.
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/me");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
};
