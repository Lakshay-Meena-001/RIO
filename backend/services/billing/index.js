import "dotenv/config";

import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import billingRouter from "./routes/billing.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import {
  startBillingRecovery,
  stopBillingRecovery,
} from "./services/billing-recovery.service.js";
import BillingTransaction from "./models/billing-transaction.model.js";
import PaymentEvent from "./models/payment-event.model.js";

import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

const PORT = Number(process.env.PORT) || 8005;
const HOST = process.env.HOST || "0.0.0.0";
const MONGODB_URI = process.env.MONGODB_URI;
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "100kb";

app.disable("x-powered-by");
app.use(helmet());

// Readiness check: Billing requires MongoDB to serve requests safely.
app.get("/health", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const status = databaseReady ? "healthy" : "unavailable";

  return res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    service: "billing",
    status,
    dependencies: {
      mongodb: databaseReady ? "ready" : "unavailable",
    },
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "RIO Billing Service",
  });
});

// IMPORTANT: Register the raw-body webhook before express.json().
app.use("/webhooks/razorpay", webhookRouter);

// Parse JSON for normal API routes.
app.use(express.json({ limit: JSON_BODY_LIMIT }));

// Gateway strips /api/billing before forwarding the request,
// so the Billing router handles /summary, /transactions, etc.
app.use("/", billingRouter);

// Not-found and centralized error handling must come last.
app.use(notFoundMiddleware);
app.use(errorHandler);

let server;
let shuttingDown = false;

async function startServer() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  await mongoose.connect(MONGODB_URI);
  await Promise.all([
    BillingTransaction.createIndexes(),
    PaymentEvent.createIndexes(),
  ]);
  console.log("Billing Service: MongoDB connected; billing indexes verified");
  startBillingRecovery();

  server = app.listen(PORT, HOST, () => {
    console.log(`Billing Service running at http://${HOST}:${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Billing Service HTTP server error:", error.message);
    process.exitCode = 1;
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Billing Service: received ${signal}; shutting down`);

  try {
    stopBillingRecovery();

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await mongoose.disconnect();
    console.log("Billing Service: shutdown complete");
  } catch (error) {
    console.error("Billing Service shutdown error:", error.message);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Failed to start Billing Service:", error.message);
  process.exitCode = 1;
});

export default app;
