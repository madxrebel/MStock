import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFIk9nMt0UH9UhDiqhhecTSsb8QZBhU_s",
  authDomain: "mstock-b8c4d.firebaseapp.com",
  projectId: "mstock-b8c4d",
  storageBucket: "mstock-b8c4d.firebasestorage.app",
  messagingSenderId: "819298287873",
  appId: "1:819298287873:web:09ee83a95f582975f45b00",
  measurementId: "G-6QK7R67KB1"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const analytics = getAnalytics(app);

const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()
const storage = getStorage(app);

export { auth, db, googleProvider, storage }


