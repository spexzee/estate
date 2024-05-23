// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "estate-45ca6.firebaseapp.com",
  projectId: "estate-45ca6",
  storageBucket: "estate-45ca6.appspot.com",
  messagingSenderId: "620337949579",
  appId: "1:620337949579:web:c3bd33528354300ddedd8e"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
