import dns from "dns";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";
import interviewRoutes from "./routes/interview.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

// Custom DNS servers help resolve MongoDB Atlas SRV records reliably.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 8003;

/*
 * ---------------------------------------------------------
 * Global Middleware
 * ---------------------------------------------------------
 */

app.use(express.json());

/*
 * ---------------------------------------------------------
 * Health Check
 * ---------------------------------------------------------
 */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Interview Service is running",
  });
});

/*
 * ---------------------------------------------------------
 * Interview Routes
 * ---------------------------------------------------------
 */

app.use("/api/interview", interviewRoutes);

/*
 * ---------------------------------------------------------
 * Global Error Handler
 * ---------------------------------------------------------
 */

app.use(errorHandler);

/*
 * ---------------------------------------------------------
 * Start Server
 * ---------------------------------------------------------
 */

const startServer = async () => {
  try {
    // Start the service only after a successful database connection.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Interview service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Interview service:", error);

    // Prevent the service from running without its required database.
    process.exit(1);
  }
};

startServer();
