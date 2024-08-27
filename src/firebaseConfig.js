// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Assicurati di importare getAnalytics
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1QVXODSlITQUw4eTjyCuEflxFFANNndA",
  authDomain: "fantamanager-ccfc3.firebaseapp.com",
  projectId: "fantamanager-ccfc3",
  storageBucket: "fantamanager-ccfc3.appspot.com",
  messagingSenderId: "289431858872",
  appId: "1:289431858872:web:aefe4675c8a0c0dfc8ce4d",
  measurementId: "G-KN025CPN4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
