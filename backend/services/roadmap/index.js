import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDatabase from "./config/db.js";
import createRoadmapRouter from "./routes/roadmap.routes.js";

// TODO: Replace this import with RIO's actual authentication middleware.
// import authMiddleware from "./middlewares/authMiddleware.js";

import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT || 8004);
const HOST = process.env.HOST || "0.0.0.0";

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : false,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || "1mb",
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "roadmap",
    status: "healthy",
  });
});

// Register after importing the verified authentication middleware.
// app.use("/api/roadmaps", createRoadmapRouter(authMiddleware));

app.use(notFoundHandler);
app.use(errorHandler);

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, HOST, () => {
      console.log(`Roadmap Service listening on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Roadmap Service:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down Roadmap Service...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    const mongoose = await import("mongoose");

    if (mongoose.default.connection.readyState !== 0) {
      await mongoose.default.connection.close();
    }

    process.exit(0);
  } catch (error) {
    console.error("Shutdown failed:", error.message);
    process.exit(1);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();

export default app;
