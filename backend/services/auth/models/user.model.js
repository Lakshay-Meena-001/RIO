import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Firebase authenticated user ki unique identity.
    firebaseID: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Basic profile information.
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
// import mongoose, { STATES } from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     firebaseID: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     coins: {
//       type: Number,
//       default: 150,
//     },
//   },
//   { timestamps: true },
// );

// const User = mongoose.model("User", userSchema);

// export default User;
