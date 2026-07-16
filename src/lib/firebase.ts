import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config Web App "Bank Sampah Web" di project `bank-sampah-kkn`. Bukan rahasia, boleh di-commit.
const firebaseConfig = {
  apiKey: "AIzaSyAODjt1HHtJT9KckKGIQOzygEnYuBKP6KI",
  authDomain: "bank-sampah-kkn.firebaseapp.com",
  projectId: "bank-sampah-kkn",
  storageBucket: "bank-sampah-kkn.firebasestorage.app",
  messagingSenderId: "598258506878",
  appId: "1:598258506878:web:a609b6b0a82fd7df5f4c2f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
