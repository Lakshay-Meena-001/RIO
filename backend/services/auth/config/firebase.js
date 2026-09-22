import { cert, initializeApp } from "firebase-admin/app";

import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

// Initialize Firebase Admin SDK once for server-side authentication.
export const app = initializeApp({
  credential: cert(serviceAccount),
});
