import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controllers/userController.js";
import { isAuth } from "./middlewares/isAuth.js";
import { proxyWithHeaders } from "./utils/proxyHeader.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const RESUME_SERVICE_URL = process.env.RESUME_SERVICE_URL;

// Basic request parsing and cookie support.
app.use(express.json());
app.use(cookieParser());

// Allow the frontend to communicate with the gateway
// while keeping browser credentials such as cookies enabled.
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

// HTTP request logging for development and debugging.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.disable("x-powered-by");

// Auth service URL is required for request forwarding.
if (!AUTH_SERVICE_URL) {
  throw new Error("AUTH_SERVICE_URL is not defined");
}
if (!RESUME_SERVICE_URL) {
  throw new Error("RESUME_SERVICE_URL is not defined");
}

// Gateway health check for monitoring and deployment systems.
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    status: "healthy",
  });
});

// Forward authentication requests to the Auth microservice.
app.use("/api/auth", proxy(AUTH_SERVICE_URL));

// Forward authentication requests to the Resume microservice.
app.use("/api/resume", isAuth, proxyWithHeaders(RESUME_SERVICE_URL));

// Return the currently authenticated user from the session.
app.get("/api/me", isAuth, getCurrentUser);

// Handle unknown gateway routes consistently.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Gateway route not found",
  });
});

// Prevent internal gateway errors from being exposed to clients.
app.use((err, req, res, next) => {
  console.error("Gateway Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal gateway error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});

// Gracefully close the gateway during shutdown/restarts.
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);

  server.close(() => {
    console.log("API Gateway stopped.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
