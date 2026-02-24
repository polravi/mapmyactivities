// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5zfbGx60xUdrdEDI57v4CBj5Ika-W3fU",
  authDomain: "mapmyactivities.firebaseapp.com",
  projectId: "mapmyactivities",
  storageBucket: "mapmyactivities.firebasestorage.app",
  messagingSenderId: "1034754138696",
  appId: "1:1034754138696:web:ce491cd626ed1d5500ee7d",
  measurementId: "G-J8RRXH7WGC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);