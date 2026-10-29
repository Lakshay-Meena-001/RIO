import axios from "axios";

// Centralized API client for communicating with the API Gateway.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    "VITE_API_URL must be configured for production builds to reach the API Gateway.",
  );
}

const api = axios.create({
  baseURL: configuredApiUrl || "http://localhost:3000",
  withCredentials: true,
});

export default api;
