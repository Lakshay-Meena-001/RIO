import mongoose from "mongoose";

import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not defined in Roadmap Service environment variables.",
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: Number(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000,
      ),
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
    });

    console.log("Roadmap Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Roadmap Service: MongoDB connection failed.", error);

    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();

    console.log("Roadmap Service: MongoDB connection closed.");
  } catch (error) {
    console.error("Roadmap Service: MongoDB disconnection failed.", error);

    throw error;
  }
};

export { connectDatabase, disconnectDatabase };

export default connectDatabase;
