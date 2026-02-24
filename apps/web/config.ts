// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "-",
  authDomain: "mapmyactivities.firebaseapp.com",
  projectId: "mapmyactivities",
  storageBucket: "mapmyactivities.firebasestorage.app",
  messagingSenderId: "kkj",
  appId: "1:njj:web:lkl",
  measurementId: "G-poo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
