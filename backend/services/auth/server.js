import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

dotenv.config();

// Custom DNS servers help resolve MongoDB Atlas SRV records reliably.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 6001;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello! From Auth service");
});

// All authentication-related routes are handled by the auth router.
app.use("/", authRouter);

const startServer = async () => {
  try {
    // Start the service only after a successful database connection.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Auth service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth service:", error);

    // Prevent the service from running without its required database.
    process.exit(1);
  }
};

startServer();
