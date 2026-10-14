import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URL;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URL is not defined in Interview Service environment variables.",
    );
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Interview Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Interview Service: MongoDB connection failed.", error);
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
    console.error("Interview Service: MongoDB disconnection failed.", error);
    throw error;
  }
};

export { connectDatabase, disconnectDatabase };
export default connectDatabase;
