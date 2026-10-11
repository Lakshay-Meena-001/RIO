import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL?.trim();

  // MongoDB is required before the Auth Service can start.
  if (!mongoUrl) {
    throw new Error(
      "MONGODB_URL is missing. Configure it in the Auth Service environment.",
    );
  }

  try {
    await mongoose.connect(mongoUrl);

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
