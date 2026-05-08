import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCU6UZusBphDG8XApxdM6OmU1duR6YwWzM",
  authDomain: "sleepsync-346f1.firebaseapp.com",
  projectId: "sleepsync-346f1",
  storageBucket: "sleepsync-346f1.firebasestorage.app",
  messagingSenderId: "562127285296",
  appId: "1:562127285296:web:0b644e2759583cf3efd1f5",
  measurementId: "G-3KE74QB72M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
