import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCofrdLOX0_g8CNSCt4Nsit-wAveYhmyP0",
  authDomain: "fantamanagertest-it.firebaseapp.com",
  projectId: "fantamanagertest-it",
  storageBucket: "fantamanagertest-it.appspot.com",
  messagingSenderId: "165397526765",
  appId: "1:165397526765:web:3f409563be13167ea334e4",
  measurementId: "G-MXC28JW5QC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
        console.log("The current browser does not support all of the features required to enable persistence");
    }
});

// Throttle function to limit requests
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export { db, auth, analytics, storage, throttle };