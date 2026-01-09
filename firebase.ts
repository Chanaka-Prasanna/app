import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your actual Firebase configuration
// Get this from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBkKczHkZboh3_mg6C7_Nr4wF3sV0Tf7fk",
  authDomain: "student-mate-bcaeb.firebaseapp.com",
  projectId: "student-mate-bcaeb",
  storageBucket: "student-mate-bcaeb.firebasestorage.app",
  messagingSenderId: "",
  appId: "1:142098117036:android:ac9bb683fa151b6f76ca09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;