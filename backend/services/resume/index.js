import dotenv from "dotenv";
import express from "express";
import { connectDB, disconnectDB } from "./config/db.js";
import resumeRouter from "./routes/resume.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6002;

app.use(express.json());

app.use("/api/resumes", resumeRouter);

app.get("/", (req, res) => {
  res.send("Hello! From Resume service");
});

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Resume service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Resume service:", error);
    process.exit(1);
  }
};

startServer();

let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  try {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Shutdown failed:", error.message);
    process.exit(1);
  }
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
