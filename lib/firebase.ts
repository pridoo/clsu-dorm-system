import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDk6OJcOZqalBYO4ZnZxWUrlhyvnp-AwTE",
  authDomain: "clsu-dorm.firebaseapp.com",
  projectId: "clsu-dorm",
  storageBucket: "clsu-dorm.firebasestorage.app",
  messagingSenderId: "609713826662",
  appId: "1:609713826662:web:85a36be1f3faa4998ef6a7",
  measurementId: "G-2SSBPPTQB4"
};

// Next.js fix: Siguraduhing isang beses lang mag-i-initialize
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app); // Para sa Admin/Manager Login
export const db = getFirestore(app); // Para sa Residents at Semesters data