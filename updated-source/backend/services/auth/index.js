import "dotenv/config";
import dns from "node:dns";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import redis from "../../shared/redis/redis.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 8001;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "auth-service",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const redisReady = redis.status === "ready";

  const healthy = databaseReady && redisReady;

  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: "auth-service",
    status: healthy ? "healthy" : "unavailable",
    dependencies: {
      mongodb: databaseReady ? "ready" : "unavailable",
      redis: redisReady ? "ready" : "unavailable",
    },
  });
});

app.use("/", authRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: "Auth route not found.",
  });
});

app.use((error, _req, res, _next) => {
  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  if (status >= 500) {
    console.error("Auth Service request failed:", error.message);
  }

  return res.status(status).json({
    success: false,
    code: status === 413 ? "PAYLOAD_TOO_LARGE" : "REQUEST_FAILED",
    message:
      status === 413
        ? "Request body is too large."
        : status >= 500
          ? "An unexpected server error occurred."
          : error.message || "The request could not be processed.",
  });
});

let httpServer;
let isShuttingDown = false;

const closeRedis = async () => {
  if (redis.status === "ready") {
    await redis.quit();
  } else if (redis.status !== "end") {
    redis.disconnect();
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await redis.connect();

    httpServer = app.listen(PORT, () => {
      console.log(`Auth Service listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Auth Service startup failed:", error.message);

    try {
      await closeRedis();
    } catch (redisError) {
      console.error("Redis cleanup failed:", redisError.message);
    }

    try {
      await disconnectDB();
    } catch (dbError) {
      console.error("MongoDB cleanup failed:", dbError.message);
    }

    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Auth Service received ${signal}. Shutting down.`);

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await closeRedis();
    await disconnectDB();
    process.exitCode = 0;
  } catch (error) {
    console.error("Auth Service shutdown failed:", error.message);
    process.exitCode = 1;
  }
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

void startServer();

export default app;
