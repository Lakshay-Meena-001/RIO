import mongoose from "mongoose";

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not defined in Roadmap Service environment variables.",
    );
  }

  try {
    await mongoose.connect(mongoUri);

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
