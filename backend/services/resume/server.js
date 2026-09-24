import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import resumeRouter from "./routes/resume.routes.js";

dotenv.config();

// Custom DNS servers help resolve MongoDB Atlas SRV records reliably.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 6002;

app.use(express.json());

app.use("/",resumeRouter)

app.get("/", (req, res) => {
  res.send("Hello! From Resume service");
});


const startServer = async () => {
  try {
    // Start the service only after a successful database connection.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Resume service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Resume service:", error);

    // Prevent the service from running without its required database.
    process.exit(1);
  }
};

startServer();
