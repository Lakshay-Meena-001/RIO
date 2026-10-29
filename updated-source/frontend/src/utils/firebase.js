import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_AUTH_SECRET,
  authDomain: "ryvo-a515f.firebaseapp.com",
  projectId: "ryvo-a515f",
  storageBucket: "ryvo-a515f.firebasestorage.app",
  messagingSenderId: "164423012366",
  appId: "1:164423012366:web:28b3c0880474dcda462c5f",
  measurementId: "G-LTV5XJ17MJ",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// Disable Firebase app verification only during local development/testing.
// Production must use normal app verification.
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, provider, githubProvider };