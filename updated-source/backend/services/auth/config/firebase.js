import "dotenv/config";
import { cert, getApps, initializeApp } from "firebase-admin/app";

const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const missingEnvVars = requiredEnvVars.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing: ${missingEnvVars.join(", ")}`,
  );
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(
  /\\n/g,
  "\n",
).trim();

if (
  !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
  !privateKey.includes("-----END PRIVATE KEY-----")
) {
  throw new Error(
    "FIREBASE_PRIVATE_KEY is invalid. Check the private key format in your environment configuration.",
  );
}

const firebaseConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID.trim(),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
    privateKey,
  }),
};

// Avoid initializing the Firebase Admin app more than once.
export const app =
  getApps().find((existingApp) => existingApp.name === "[DEFAULT]") ??
  initializeApp(firebaseConfig);
