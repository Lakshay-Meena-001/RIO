import dns from "node:dns";
import mongoose from "mongoose"

export const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL?.trim();

  // MongoDB connection is required before the service starts.
  if (!mongoUrl) {
    throw new Error(
      "MONGODB_URL is not defined in Resume Service environment variables.",
    );
  }

  try {

    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(mongoUrl);

    console.log("Resume Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Resume Service: MongoDB connection failed.", error.message);

    // Let the server startup handler decide how to exit.
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    // Close the connection only when MongoDB is not already disconnected.
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();

      console.log("Resume Service: MongoDB connection closed.");
    }
  } catch (error) {
    console.error(
      "Resume Service: MongoDB disconnection failed.",
      error.message,
    );

    // Let the shutdown handler know that cleanup failed.
    throw error;
  }
};

export default connectDB;
