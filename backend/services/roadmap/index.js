import "dotenv/config";

import express from "express";

import roadmapRoutes from "./routes/roadmap.routes.js";

import { connectDatabase, disconnectDatabase } from "./config/db.js";

import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT) || 5005;

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "roadmap-service",
    status: "healthy",
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/roadmaps", roadmapRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Roadmap Service route not found.",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Server Startup
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Roadmap Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Roadmap Service failed to start.", error);

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown = async (signal) => {
  console.log(`Roadmap Service received ${signal}. Shutting down...`);

  try {
    await disconnectDatabase();

    console.log("Roadmap Service shutdown complete.");

    process.exit(0);
  } catch (error) {
    console.error("Roadmap Service shutdown failed.", error);

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

/*
|--------------------------------------------------------------------------
| Start Service
|--------------------------------------------------------------------------
*/

startServer();
