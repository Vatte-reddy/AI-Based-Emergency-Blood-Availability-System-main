import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzkLDOUHxG4qbSxzoNxZk7q8B05oOQx2A",
  authDomain: "bloodhub-33c0f.firebaseapp.com",
  projectId: "bloodhub-33c0f",
  storageBucket: "bloodhub-33c0f.appspot.com", // ✅ FIXED
  messagingSenderId: "280102848880",
  appId: "1:280102848880:web:0b4393732ffc9f236d27b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();