import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URL?.trim();

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URL is not defined in Interview Service environment variables.",
    );
  }

  const configuredTimeout = Number(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  );
  const serverSelectionTimeoutMS =
    Number.isInteger(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 10000;

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS });
    console.log("Interview Service: MongoDB connected successfully.");
  } catch (error) {
    console.error(
      "Interview Service: MongoDB connection failed.",
      error.message,
    );
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Interview Service: MongoDB connection closed.");
    }
  } catch (error) {
    console.error(
      "Interview Service: MongoDB disconnection failed.",
      error.message,
    );
    throw error;
  }
};

export { connectDatabase, disconnectDatabase };
export default connectDatabase;
