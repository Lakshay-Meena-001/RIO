import dns from "dns";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

// MongoDB SRV DNS ke liye custom DNS servers
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 6001;

app.get("/", (req, res) => {
  res.send("Hello! From Auth service");
});

app.use("/", authRouter);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Auth service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth service:", error);
  }
};

startServer();
