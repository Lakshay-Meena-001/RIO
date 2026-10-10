import "dotenv/config";

import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDatabase from "./config/db.js";
import createRoadmapRouter from "./routes/roadmap.routes.js";
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

// Verify that the request came through the trusted API Gateway.
function gatewayAuthMiddleware(req, res, next) {
  const configuredSecret = process.env.ROADMAP_INTERNAL_SECRET;
  const suppliedSecret = req.get("x-internal-service-secret");
  const userId = req.get("x-user-id");

  if (
    !configuredSecret ||
    typeof suppliedSecret !== "string" ||
    !suppliedSecret
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized service request",
    });
  }

  const expected = Buffer.from(configuredSecret, "utf8");
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

  // Controllers expect req.user.id.
  req.user = { id: userId.trim() };

  return next();
}

// Public catalog reads are defined in the router.
// Protected endpoints use the verified Gateway identity.
app.use("/api/roadmaps", createRoadmapRouter(gatewayAuthMiddleware));

app.use(notFoundHandler);
app.use(errorHandler);

let server;

async function startServer() {
  try {
    if (!process.env.ROADMAP_INTERNAL_SECRET) {
      throw new Error("ROADMAP_INTERNAL_SECRET must be configured");
    }

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
