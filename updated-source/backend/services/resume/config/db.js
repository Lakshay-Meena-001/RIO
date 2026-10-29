import dns from "node:dns";
import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL?.trim();

  if (!mongoUrl) {
    throw new Error(
      "MONGODB_URL is not defined in Resume Service environment variables.",
    );
  }

  try {
    // Use public resolvers because the machine's default resolver refuses SRV lookups.
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    const configuredTimeout = Number(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 10000,
    );
    const serverSelectionTimeoutMS =
      Number.isInteger(configuredTimeout) && configuredTimeout > 0
        ? configuredTimeout
        : 10000;

    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS });
    console.log("Resume Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Resume Service: MongoDB connection failed.", error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) return;

  try {
    await mongoose.disconnect();
    console.log("Resume Service: MongoDB disconnected successfully.");
  } catch (error) {
    console.error(
      "Resume Service: MongoDB disconnection failed.",
      error.message,
    );
    throw error;
  }
};

export default connectDB;
