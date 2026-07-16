import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// GANTI dengan config Web App dari Firebase Console project `bank-sampah-kkn`
// (Console → Project settings → General → Add app → Web). Bukan rahasia, boleh di-commit.
const firebaseConfig = {
  apiKey: "GANTI_API_KEY",
  authDomain: "bank-sampah-kkn.firebaseapp.com",
  projectId: "bank-sampah-kkn",
  storageBucket: "bank-sampah-kkn.firebasestorage.app",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
