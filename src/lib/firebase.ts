import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFIk9nMt0UH9UhDiqhhecTSsb8QZBhU_s",
  authDomain: "mstock-b8c4d.firebaseapp.com",
  projectId: "mstock-b8c4d",
  storageBucket: "mstock-b8c4d.firebasestorage.app",
  messagingSenderId: "819298287873",
  appId: "1:819298287873:web:09ee83a95f582975f45b00",
  measurementId: "G-6QK7R67KB1"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Initialize Analytics only on the client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, googleProvider, storage, analytics };
