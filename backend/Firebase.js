import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC6eoVojmVRU7623RVJOP5eixYevQT17XI",
    authDomain: "blockpoll-5bd7f.firebaseapp.com",
    projectId: "blockpoll-5bd7f",
    storageBucket: "blockpoll-5bd7f.firebasestorage.app",
    messagingSenderId: "205948130362",
    appId: "1:205948130362:web:3a2bd4a535d037923c5103"
  };
  
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);