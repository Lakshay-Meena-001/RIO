import "dotenv/config";
import crypto from "node:crypto";
import express from "express";

import { connectDatabase, disconnectDatabase } from "./config/db.js";
import interviewRoutes from "./routes/interview.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 8003;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

function gatewayAuthMiddleware(req, res, next) {
  const expectedSecret = process.env.INTERVIEW_INTERNAL_SECRET;
  const suppliedSecret = req.get("x-internal-service-secret");
  const userId = req.get("x-user-id");

  if (
    !expectedSecret?.trim() ||
    typeof suppliedSecret !== "string" ||
    !suppliedSecret
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized service request",
    });
  }

  const expected = Buffer.from(expectedSecret, "utf8");
  const supplied = Buffer.from(suppliedSecret, "utf8");

  if (
    expected.length !== supplied.length ||
    !crypto.timingSafeEqual(expected, supplied)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized service request",
    });
  }

  if (typeof userId !== "string" || !userId.trim()) {
    return res.status(401).json({
      success: false,
      message: "Authenticated user identity is missing",
    });
  }

  return next();
}

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "interview-service",
    status: "healthy",
  });
});

app.use("/api/interview", gatewayAuthMiddleware, interviewRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(errorHandler);

let server;
let shuttingDown = false;

async function startServer() {
  try {
    if (!process.env.INTERVIEW_INTERNAL_SECRET?.trim()) {
      throw new Error("INTERVIEW_INTERNAL_SECRET must be configured");
    }

    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log(`Interview service running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Interview service server error:", error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Interview service failed to start:", error.message);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down interview service...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Interview service shutdown failed:", error.message);
    process.exit(1);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();

export default app;
