import mongoose, { STATES } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseID: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    coins: {
      type: Number,
      default: 150,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
