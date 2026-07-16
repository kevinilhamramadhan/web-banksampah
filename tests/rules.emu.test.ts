// Verifikasi format tulis client web lolos firestore.rules ASLI (emulator, bukan produksi).
// Jalankan: npm run test:emu  (emulator dinyalakan oleh firebase emulators:exec)
import { beforeAll, describe, expect, it } from "vitest";
import { connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";
import { currentSeason, poinDari } from "../src/lib/constants";
import { createSetoran, login, register, searchWarga } from "../src/lib/repo";

const PROJECT = "bank-sampah-kkn";
const FS = "http://127.0.0.1:8080";
const AUTH = "http://127.0.0.1:9099";

beforeAll(() => {
  connectAuthEmulator(auth, AUTH, { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
});

/** Tulis dokumen apa pun lewat pintu admin emulator (bypass rules) — untuk seed data uji. */
export async function seedDoc(path: string, fields: Record<string, unknown>) {
  const res = await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFsFields(fields) }),
  });
  if (!res.ok) throw new Error(`seed ${path}: ${res.status} ${await res.text()}`);
}

function toFsFields(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    out[k] =
      typeof v === "number"
        ? Number.isInteger(v)
          ? { integerValue: String(v) }
          : { doubleValue: v }
        : typeof v === "boolean"
          ? { booleanValue: v }
          : { stringValue: String(v) };
  }
  return out;
}

/** Tandai email user terverifikasi lewat pintu admin auth emulator. */
export async function setEmailVerified(localId: string) {
  const res = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:update`, {
    method: "POST",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ localId, emailVerified: true }),
  });
  if (!res.ok) throw new Error(`setEmailVerified: ${res.status} ${await res.text()}`);
}

describe("registrasi warga vs rules", () => {
  it("register() membuat dokumen users yang lolos rules", async () => {
    await register("Budi Warga", "0812345678", "RT 01 RW 02", "budi@test.com", "rahasia123");
    const uid = auth.currentUser!.uid;
    const snap = await getDoc(doc(db, "users", uid));
    expect(snap.exists()).toBe(true);
    expect(snap.get("role")).toBe("warga");
    expect(snap.get("saldoPoin")).toBe(0);
    expect(snap.get("namaLower")).toBe("budi warga");
    await signOut(auth);
  });

  it("registrasi curang (saldo awal > 0) DITOLAK rules", async () => {
    // Buat akun auth kedua lalu coba tulis dokumen dengan saldo 100.
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const cred = await createUserWithEmailAndPassword(auth, "curang@test.com", "rahasia123");
    await expect(
      setDoc(doc(db, "users", cred.user.uid), {
        role: "warga",
        nama: "Curang",
        noHp: "08",
        alamat: "x",
        email: "curang@test.com",
        namaLower: "curang",
        saldoPoin: 100,
        createdAt: serverTimestamp(),
      }),
    ).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("registrasi role ops DITOLAK rules", async () => {
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const cred = await createUserWithEmailAndPassword(auth, "fakeops@test.com", "rahasia123");
    await expect(
      setDoc(doc(db, "users", cred.user.uid), {
        role: "ops",
        nama: "Fake Ops",
        noHp: "08",
        alamat: "x",
        email: "fakeops@test.com",
        namaLower: "fake ops",
        saldoPoin: 0,
        createdAt: serverTimestamp(),
      }),
    ).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("login() mengembalikan role", async () => {
    const role = await login("budi@test.com", "rahasia123");
    expect(role).toBe("warga");
    await signOut(auth);
  });
});

// ---------- Setoran (Checkpoint 3) ----------

async function buatOps(email: string, nama: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, "rahasia123");
  // Akun ops dibuat manual (bypass rules) — meniru pembuatan via Firebase Console.
  await seedDoc(`users/${cred.user.uid}`, {
    role: "ops",
    nama,
    noHp: "0800",
    alamat: "posko",
    email,
    namaLower: nama.toLowerCase(),
    saldoPoin: 0,
  });
  return cred.user.uid;
}

async function wargaDoc(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return { uid, ...snap.data() } as import("../src/lib/models").UserDoc;
}

describe("setoran vs rules", () => {
  it("createSetoran() lolos rules; saldo & leaderboard bertambah persis", async () => {
    await signInWithEmailAndPassword(auth, "budi@test.com", "rahasia123");
    const wargaUid = auth.currentUser!.uid;
    await signOut(auth);

    await buatOps("ops1@test.com", "Ops Satu");
    const warga = await wargaDoc(wargaUid);

    const poin = poinDari(1.5); // 8 — pembulatan identik Android
    await createSetoran(warga, [{ jenisSampahId: "plastik", jenisSampahNama: "Plastik", beratKg: 1.5, poin }]);

    const sesudah = await wargaDoc(wargaUid);
    expect(sesudah.saldoPoin).toBe(warga.saldoPoin + 8);

    const leader = await getDoc(doc(db, "leaderboard", `${currentSeason()}__${wargaUid}`));
    expect(leader.get("poin")).toBe(8);
    expect(leader.get("season")).toBe(currentSeason());
    await signOut(auth);
  });

  it("setoran dengan totalPoin curang DITOLAK rules", async () => {
    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    const opsUid = auth.currentUser!.uid;
    const hasil = await searchWarga("budi");
    const warga = hasil[0];

    const setoranRef = doc(collection(db, "setoran"));
    const batch = writeBatch(db);
    batch.set(setoranRef, {
      wargaId: warga.uid,
      wargaNama: warga.nama,
      opsId: opsUid,
      items: [{ jenisSampahId: "plastik", jenisSampahNama: "Plastik", beratKg: 1, poin: 5 }],
      totalPoin: 5,
      tanggal: serverTimestamp(),
    });
    // Curang: saldo dinaikkan 500, padahal totalPoin dokumen 5.
    batch.update(doc(db, "users", warga.uid), { saldoPoin: increment(500), lastTxnId: setoranRef.id });
    await expect(batch.commit()).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("warga biasa tidak bisa membuat setoran", async () => {
    await signInWithEmailAndPassword(auth, "budi@test.com", "rahasia123");
    const warga = await wargaDoc(auth.currentUser!.uid);
    await expect(
      createSetoran(warga, [{ jenisSampahId: "plastik", jenisSampahNama: "Plastik", beratKg: 1, poin: 5 }]),
    ).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("searchWarga menemukan by prefix nama dan menyaring ops", async () => {
    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    const byNama = await searchWarga("bud");
    expect(byNama.map((w) => w.nama)).toContain("Budi Warga");
    const byOpsNama = await searchWarga("ops satu");
    expect(byOpsNama).toHaveLength(0); // akun ops tersaring di client
    const byHp = await searchWarga("0812");
    expect(byHp.map((w) => w.nama)).toContain("Budi Warga");
    await signOut(auth);
  });
});
