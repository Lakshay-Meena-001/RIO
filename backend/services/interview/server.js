import "dotenv/config";
import dns from "node:dns";
import express from "express";

import { connectDB } from "./config/db.js";
import interviewRoutes from "./routes/interview.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const PORT = process.env.PORT || 8003;

// -----------------------------------------------------------------------------
// DNS
// -----------------------------------------------------------------------------

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// -----------------------------------------------------------------------------
// Middlewares
// -----------------------------------------------------------------------------

app.use(express.json({ limit: "1mb" }));

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "interview-service",
    status: "healthy",
  });
});

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

app.use("/api/interview", interviewRoutes);

// -----------------------------------------------------------------------------
// 404 Handler
// -----------------------------------------------------------------------------

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// -----------------------------------------------------------------------------
// Global Error Handler
// -----------------------------------------------------------------------------

app.use(errorHandler);

// -----------------------------------------------------------------------------
// Server Startup
// -----------------------------------------------------------------------------

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Interview service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Interview service failed to start:", error);
    process.exit(1);
  }
};

startServer();
