import dns from "node:dns";
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import redis from "../../shared/redis/redis.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 6001;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Auth Service",
    message: "Auth Service is running.",
  });
});

app.use("/", authRouter);

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
      console.log(`Auth Service is running on port ${PORT}.`);
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

  console.log(`Auth Service received ${signal}. Starting shutdown...`);

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

    console.log("Auth Service shutdown completed.");
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
