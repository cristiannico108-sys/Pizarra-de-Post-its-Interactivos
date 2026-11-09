/*==================================================
        VINCULAR CON FIRESTORE
  ================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGzWyFn7PPvn8xrzSZk7fdv2tFdQWsRhQ",
  authDomain: "fullstack-45eb3.firebaseapp.com",
  projectId: "fullstack-45eb3",
  storageBucket: "fullstack-45eb3.firebasestorage.app",
  messagingSenderId: "409582466590",
  appId: "1:409582466590:web:7359f904dd3545ecf1600f",
  measurementId: "G-1PK4TR1FXG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notasRef = collection(db, "Post-It");

console.log("Firebase configurado correctamente");