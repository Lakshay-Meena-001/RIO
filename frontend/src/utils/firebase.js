// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_AUTH_SECRET,
  authDomain: "ryvo-a515f.firebaseapp.com",
  projectId: "ryvo-a515f",
  storageBucket: "ryvo-a515f.firebasestorage.app",
  messagingSenderId: "164423012366",
  appId: "1:164423012366:web:28b3c0880474dcda462c5f",
  measurementId: "G-LTV5XJ17MJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, provider, githubProvider };
