import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL?.trim();

  if (!mongoUrl) {
    throw new Error(
      "MONGODB_URL is missing. Configure it in the Auth Service environment.",
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
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS });
    console.log("Auth Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Auth Service: MongoDB connection failed.", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Auth Service: MongoDB disconnected successfully.");
    }
  } catch (error) {
    console.error("Auth Service: MongoDB disconnection failed.", error.message);
    throw error;
  }
};

export { connectDB, disconnectDB };
export default connectDB;
