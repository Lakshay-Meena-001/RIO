import { cert, initializeApp } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK once for server-side authentication.
export const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
