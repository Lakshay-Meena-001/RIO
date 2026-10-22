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

// Log out the current user and destroy the server-side session.
export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");

    return response.data;
  } catch (error) {
    console.error("Failed to logout:", error);

    throw error;
  }
};

/*
 * Deduct an amount from the authenticated user's balance.
 */
export const deductBalance = async (data) => {
  try {
    const response = await api.post("/api/auth/user-coins", data);
    return response.data;
  } catch (error) {
    console.error("Failed to deduct balance:", error);
    throw error;
  }
};

// Save professional profile fields to the authenticated user's database record.
export const updateProfessionalProfile = async (profileData) => {
  const response = await api.patch("/api/profile", profileData);
  return response.data;
};
