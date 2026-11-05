// 2. LA CONFIGURACIÓN EXACTA DE TU APP
const firebaseConfig = {
  apiKey: "AIzaSyDGzWyFn7PPvn8xrzSZk7fdv2tFdQWsRhQ",
  authDomain: "fullstack-45eb3.firebaseapp.com",
  projectId: "fullstack-45eb3",
  storageBucket: "fullstack-45eb3.firebasestorage.app",
  messagingSenderId: "409582466590",
  appId: "1:409582466590:web:7359f904dd3545ecf1600f",
  measurementId: "G-1PK4TR1FXG"
};

// 3. INICIALIZAR FIREBASE Y LA BASE DE DATOS
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const notasRef = collection(db, "Post-It");

console.log("Firebase configurado correctamente");

console.log("Firebase configurado");