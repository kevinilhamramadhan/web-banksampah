// Repository tipis di atas Firebase SDK — port 1:1 dari Repo.kt aplikasi Android.
// Semua format tulis HARUS persis begini atau ditolak firestore.rules.
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { Timestamp, runTransaction, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN, currentSeason } from "./constants";
import type { Penukaran, Role, Setoran, SetoranItem, UserDoc } from "./models";

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

// ---------- Realtime ----------

export function onUserDoc(uid: string, cb: (u: UserDoc | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "users", uid), (snap) =>
    cb(snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserDoc) : null),
  );
}

// ---------- Riwayat berhalaman (limit 20 + muat lebih banyak) ----------
// Query persis pola Android — hanya memakai composite index yang sudah ada.

export const PAGE_SIZE = 20;

export interface Page<T> {
  items: T[];
  last: QueryDocumentSnapshot | null;
}

type PihakField = "wargaId" | "opsId";

async function pageOf<T>(
  koleksi: "setoran" | "penukaran",
  urutField: "tanggal" | "createdAt",
  field: PihakField,
  id: string,
  after: QueryDocumentSnapshot | null,
): Promise<Page<T>> {
  const cons = [where(field, "==", id), orderBy(urutField, "desc"), ...(after ? [startAfter(after)] : []), limit(PAGE_SIZE)];
  const snap = await getDocs(query(collection(db, koleksi), ...cons));
  return { items: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T), last: snap.docs.at(-1) ?? null };
}

export const setoranPage = (field: PihakField, id: string, after: QueryDocumentSnapshot | null) =>
  pageOf<Setoran>("setoran", "tanggal", field, id, after);

export const penukaranPage = (field: PihakField, id: string, after: QueryDocumentSnapshot | null) =>
  pageOf<Penukaran>("penukaran", "createdAt", field, id, after);

// ---------- Cari warga (prefix search sederhana, persis Android) ----------
// Tanpa filter role di query (hindari composite index); ops tersaring di client.

export async function searchWarga(teks: string): Promise<UserDoc[]> {
  const q = teks.trim().toLowerCase();
  if (!q) return [];
  const field = /^[\d+]/.test(q) ? "noHp" : "namaLower";
  const snap = await getDocs(
    query(collection(db, "users"), orderBy(field), startAt(q), endAt(q + ""), limit(12)),
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserDoc).filter((u) => u.role === "warga");
}

// ---------- Setoran (ops): satu batch atomik, persis Repo.kt ----------
// setoran baru + saldo warga bertambah (lastTxnId divalidasi rules) + leaderboard musiman.

export async function createSetoran(warga: UserDoc, items: SetoranItem[]): Promise<void> {
  if (items.length === 0) throw new Error("Minimal satu jenis sampah");
  const total = items.reduce((a, i) => a + i.poin, 0);
  const setoranRef = doc(collection(db, "setoran"));
  const season = currentSeason();
  const batch = writeBatch(db);
  batch.set(setoranRef, {
    wargaId: warga.uid,
    wargaNama: warga.nama,
    opsId: auth.currentUser!.uid,
    items: items.map((i) => ({
      jenisSampahId: i.jenisSampahId,
      jenisSampahNama: i.jenisSampahNama,
      beratKg: i.beratKg,
      poin: i.poin,
    })),
    totalPoin: total,
    tanggal: serverTimestamp(),
  });
  batch.update(doc(db, "users", warga.uid), { saldoPoin: increment(total), lastTxnId: setoranRef.id });
  // Leaderboard musiman: hanya naik saat setoran, tidak berkurang saat penukaran (sama dengan Android).
  batch.set(
    doc(db, "leaderboard", `${season}__${warga.uid}`),
    { season, uid: warga.uid, nama: warga.nama, poin: increment(total) },
    { merge: true },
  );
  await batch.commit();
}

// ---------- Penukaran poin via QR ----------

export const TOKEN_UMUR_MENIT = 3;

export async function createPenukaran(warga: UserDoc, poin: number): Promise<string> {
  if (poin < MIN_TUKAR_POIN) throw new Error(`Minimal penukaran ${MIN_TUKAR_POIN} poin`);
  const ref = doc(collection(db, "penukaran"));
  await setDoc(ref, {
    wargaId: warga.uid,
    wargaNama: warga.nama,
    opsId: auth.currentUser!.uid,
    poinDitukar: poin,
    jumlahRupiah: poin * RUPIAH_PER_POIN,
    status: "pending",
    qrToken: crypto.randomUUID(),
    tokenExpiredAt: Timestamp.fromMillis(Date.now() + TOKEN_UMUR_MENIT * 60_000),
    confirmedAt: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function onPenukaran(id: string, cb: (p: Penukaran | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "penukaran", id), (snap) =>
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Penukaran) : null),
  );
}

export const cancelPenukaran = (id: string) => updateDoc(doc(db, "penukaran", id), { status: "cancelled" });

/**
 * Dipanggil warga setelah scan QR — persis Repo.kt: transaction atomik
 * pending→confirmed + saldo berkurang poinDitukar (rules memvalidasi delta).
 */
export async function confirmPenukaran(token: string): Promise<Penukaran> {
  const me = auth.currentUser?.uid;
  if (!me) throw new Error("Belum login");
  const found = await getDocs(
    query(collection(db, "penukaran"), where("qrToken", "==", token), where("wargaId", "==", me), limit(1)),
  );
  const ref = found.docs[0]?.ref;
  if (!ref) throw new Error("QR tidak valid atau bukan untuk akun Anda");
  const userRef = doc(db, "users", me);
  await runTransaction(db, async (t) => {
    const p = await t.get(ref);
    const status = p.get("status") as string;
    if (status !== "pending") throw new Error("Penukaran ini sudah diproses. Minta ops membuat QR baru.");
    const exp = (p.get("tokenExpiredAt") as Timestamp | undefined)?.toMillis() ?? 0;
    if (exp < Date.now()) throw new Error("QR sudah kedaluwarsa. Minta ops membuat ulang.");
    const poin = p.get("poinDitukar") as number;
    t.update(ref, { status: "confirmed", confirmedAt: serverTimestamp() });
    t.update(userRef, { saldoPoin: increment(-poin), lastTxnId: p.id });
  });
  const after = await getDoc(ref);
  return { id: after.id, ...after.data() } as Penukaran;
}
