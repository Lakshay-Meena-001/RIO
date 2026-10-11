import dns from "node:dns";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import { connectDB, disconnectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

// Load environment variables before application startup.
dotenv.config();

// Preserve the existing DNS resolver configuration.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 6001;

// Disable Express framework identification in response headers.
app.disable("x-powered-by");

// Limit incoming JSON payload size.
app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

// Basic service health endpoint.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Auth Service",
    message: "Auth Service is running.",
  });
});

// Preserve existing Auth Service routes.
app.use("/", authRouter);

let httpServer;
let isShuttingDown = false;

const startServer = async () => {
  try {
    // Do not accept requests until MongoDB is connected.
    await connectDB();

    httpServer = app.listen(PORT, () => {
      console.log(`Auth Service is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Auth Service startup failed:", error.message);
    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Auth Service received ${signal}. Starting shutdown...`);

  try {
    // Stop accepting new HTTP connections before disconnecting MongoDB.
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await disconnectDB();

    console.log("Auth Service shutdown completed.");
    process.exitCode = 0;
  } catch (error) {
    console.error("Auth Service shutdown failed:", error.message);
    process.exitCode = 1;
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
