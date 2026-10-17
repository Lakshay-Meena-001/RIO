import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URI?.trim();

  // MongoDB is required before the Billing Service can start.
  if (!mongoUrl) {
    throw new Error(
      "MONGODB_URI is missing. Configure it in the Billing Service environment.",
    );
  }

  try {
    await mongoose.connect(mongoUrl);

    console.log("Billing Service: MongoDB connected successfully.");
  } catch (error) {
    console.error("Billing Service: MongoDB connection failed.", error.message);

    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();

      console.log("Billing Service: MongoDB disconnected successfully.");
    }
  } catch (error) {
    console.error(
      "Billing Service: MongoDB disconnection failed.",
      error.message,
    );

    throw error;
  }
};

export { connectDB, disconnectDB };

export default connectDB;
