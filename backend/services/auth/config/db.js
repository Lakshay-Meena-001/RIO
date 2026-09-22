import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // MongoDB connection is required before starting the service.
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    // Re-throw so the service startup can handle the failure.
    throw error;
  }
};
