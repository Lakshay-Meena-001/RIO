import "dotenv/config";
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/db.js";
import resumeRouter from "./routes/resume.routes.js";
import Resume from "./models/resume.model.js";
import redis from "../../shared/redis/redis.js";

const app = express();
const PORT = Number(process.env.PORT) || 8002;
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT?.trim() || "1mb";

app.disable("x-powered-by");
app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "resume-service",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    service: "resume-service",
    status: databaseReady ? "healthy" : "unavailable",
    dependencies: {
      mongodb: databaseReady ? "ready" : "unavailable",
    },
  });
});

app.use("/api/resumes", resumeRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: "Resume route not found.",
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      code: error.code,
      message: tooLarge
        ? "The uploaded PDF exceeds the allowed file size."
        : "The uploaded file request is invalid.",
    });
  }

  if (error?.code === "INVALID_RESUME_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      code: error.code,
      message: "Only PDF files are allowed.",
    });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large.",
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      code: "INVALID_JSON",
      message: "Request body contains invalid JSON.",
    });
  }

  console.error("Resume Service request failed:", {
    message: error?.message,
    code: error?.code,
  });

  return res.status(500).json({
    success: false,
    code: "REQUEST_FAILED",
    message: "An unexpected server error occurred.",
  });
});

let server;
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
    // Ensure the unique idempotency index exists before accepting uploads.
    await Resume.init();

    server = app.listen(PORT, () => {
      console.log(`Resume Service listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Resume Service startup failed:", error.message);
    try {
      await closeRedis();
    } catch (redisError) {
      console.error("Resume Service Redis cleanup failed:", redisError.message);
    }
    try {
      await disconnectDB();
    } catch (dbError) {
      console.error("Resume Service MongoDB cleanup failed:", dbError.message);
    }
    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Resume Service received ${signal}. Shutting down.`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await closeRedis();
    await disconnectDB();
    process.exitCode = 0;
  } catch (error) {
    console.error("Resume Service shutdown failed:", error.message);
    process.exitCode = 1;
  }
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

void startServer();

export default app;
