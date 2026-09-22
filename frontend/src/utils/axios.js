import axios from "axios";

// Centralized API client for communicating with the API Gateway.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

export default api;