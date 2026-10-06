import "dotenv/config";
import dns from "node:dns";
import express from "express";

import { connectDB } from "./config/db.js";
import roadmapRoutes from "./routes/roadmap.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT) || 8004;

// Use reliable public DNS resolvers for external API requests.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Parse JSON request bodies.
app.use(express.json({ limit: "1mb" }));

// Service health check.
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "roadmap-service",
    status: "healthy",
  });
});

// Roadmap API routes.
app.use("/api/roadmap", roadmapRoutes);

// Handle unknown routes.
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Handle application errors.
app.use(errorHandler);

// Start the service only after MongoDB connection succeeds.
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Roadmap service running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Roadmap service failed to start:", error);

    process.exit(1);
  }
};

startServer();
