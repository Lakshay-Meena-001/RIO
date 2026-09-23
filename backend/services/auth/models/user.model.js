import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Firebase authenticated user's unique identity.
    firebaseID: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Basic profile information.
    // Phone users can initially use the default value
    // until the name onboarding step is completed.
    name: {
      type: String,
      required: true,
      default: "User",
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // Email is optional because Firebase phone users
    // may not have an email address.
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // Phone number is optional because email/social users
    // may not have a phone number.
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Minimum Info Required
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // Professional profile information.
    headline: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    profileImage: {
      type: String,
      trim: true,
    },

    // Current professional/learning status.
    currentRole: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    targetRole: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Skills are kept lightweight here.
    // Detailed skill-gap analysis belongs to the roadmap/interview domain.
    skills: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Links to professional profiles.
    linkedinUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    githubUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Credits used by paid/AI features.
    // Actual credit transactions should be maintained separately
    // instead of relying only on this balance.
    coins: {
      type: Number,
      default: 150,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
