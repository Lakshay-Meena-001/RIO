import "dotenv/config";

import express from "express";

import roadmapRoutes from "./routes/roadmap.routes.js";

import connectDatabase, { disconnectDatabase } from "./config/db.js";

import errorHandler from "./middlewares/errorHandler.js";

// ============================================================
// APP CONFIG
// ============================================================

const PORT = Number(
  process.env.PORT || process.env.ROADMAP_SERVICE_PORT || 5005,
);

const HOST = process.env.HOST || "0.0.0.0";

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.disable("x-powered-by");

app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,

    limit: process.env.JSON_BODY_LIMIT || "1mb",
  }),
);

// ============================================================
// HEALTH
// ============================================================

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,

    service: "roadmap-service",

    status: "healthy",

    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// ROUTES
// ============================================================

app.use("/api/roadmaps", roadmapRoutes);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message: "Route not found",
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// SERVER START
// ============================================================

let server = null;

let shuttingDown = false;

async function startServer() {
  try {
    // --------------------------------------------------------
    // DATABASE
    // --------------------------------------------------------

    await connectDatabase();

    // --------------------------------------------------------
    // HTTP SERVER
    // --------------------------------------------------------

    server = app.listen(PORT, HOST, () => {
      console.log(`[Roadmap Service] running on ${HOST}:${PORT}`);
    });

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    server.on("error", (error) => {
      console.error("[Roadmap Service] server error:", error);

      process.exitCode = 1;
    });
  } catch (error) {
    console.error("[Roadmap Service] startup failed:", error);

    await disconnectDatabase();

    process.exit(1);
  }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`[Roadmap Service] ${signal} received. Shutting down...`);

  try {
    // --------------------------------------------------------
    // STOP HTTP SERVER
    // --------------------------------------------------------

    if (server) {
      await new Promise((resolve) => {
        server.close(() => resolve());
      });
    }

    // --------------------------------------------------------
    // CLOSE DATABASE
    // --------------------------------------------------------

    await disconnectDB();

    console.log("[Roadmap Service] shutdown complete");

    process.exit(0);
  } catch (error) {
    console.error("[Roadmap Service] shutdown failed:", error);

    process.exit(1);
  }
}

// ============================================================
// SIGNALS
// ============================================================

process.once("SIGINT", () => {
  shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  shutdown("SIGTERM");
});

// ============================================================
// START
// ============================================================

startServer();

// ============================================================
// EXPORT APP
// ============================================================

export default app;
