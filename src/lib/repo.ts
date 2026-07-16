// Repository tipis di atas Firebase SDK — port 1:1 dari Repo.kt aplikasi Android.
// Semua format tulis HARUS persis begini atau ditolak firestore.rules.
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Role } from "./models";

// ---------- Auth ----------

export async function register(nama: string, noHp: string, alamat: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Keys persis sesuai rules users.create: hasOnly([...]) — jangan tambah/kurangi.
  await setDoc(doc(db, "users", cred.user.uid), {
    role: "warga",
    nama,
    noHp,
    alamat,
    email,
    namaLower: nama.toLowerCase(),
    saldoPoin: 0,
    createdAt: serverTimestamp(),
  });
  await sendEmailVerification(cred.user);
}

export async function login(email: string, password: string): Promise<Role> {
  await signInWithEmailAndPassword(auth, email, password);
  const role = await myRole();
  if (!role) {
    await signOut(auth);
    throw new Error("Akun tidak terdaftar di sistem bank sampah");
  }
  return role;
}

export async function myRole(): Promise<Role | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return (snap.get("role") as Role | undefined) ?? null;
}

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export async function resendVerification() {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
}

/** Reload user dari server; true kalau email sudah terverifikasi. */
export async function reloadUser(): Promise<boolean> {
  await auth.currentUser?.reload();
  return auth.currentUser?.emailVerified === true;
}

export const logout = () => signOut(auth);
