// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCX4RV5bH5fl4rSfcrk5cYA8bY13tG_1oE",
  authDomain: "kashif-ash3a.firebaseapp.com",
  projectId: "kashif-ash3a",
  storageBucket: "kashif-ash3a.firebasestorage.app",
  messagingSenderId: "138872795711",
  appId: "1:138872795711:web:a854cfcfe8094545133e8a",
  measurementId: "G-09C513TSDN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
