// auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    getDoc, // <-- FIXED: Added getDoc to the import list
    onSnapshot,
    serverTimestamp,
    addDoc,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs8lG2Bx-ApJt8fQTXWqxUZIxqcdFxcGQ",
  authDomain: "orderreceive-46640.firebaseapp.com",
  projectId: "orderreceive-46640",
  storageBucket: "orderreceive-46640.appspot.com",
  messagingSenderId: "546542212664",
  appId: "1:546542212664:web:72181cb5e654ebe646f8cd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    onAuthStateChanged, 
    signOut, 
    db, 
    doc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    getDoc, // <-- FIXED: Added getDoc to the export list
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onSnapshot,
    serverTimestamp,
    addDoc,
    orderBy
};
