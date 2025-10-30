// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPDIwU8ieoZqxGeu90aQVN6RAJ9fCXnm4",
  authDomain: "yobhasleepwear-5ae76.firebaseapp.com",
  projectId: "yobhasleepwear-5ae76",
  storageBucket: "yobhasleepwear-5ae76.firebasestorage.app",
  messagingSenderId: "506776910145",
  appId: "1:506776910145:web:36ca57d1fe7de6b88e09c0",
  measurementId: "G-5HE9EY4SVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);