import "dotenv/config";
import dns from "node:dns";
import express from "express";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 8004;

// DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Middlewares
app.use(express.json({ limit: "1mb" }));

// Health Check
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "roadmap-service",
    status: "healthy",
  });
});

// Routes
app.use("/api/roadmap", roadmapRoutes);

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});


// Server Startup

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Roadmap service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Roadmap service failed to start:", error);
    process.exit(1);
  }
};

startServer();
