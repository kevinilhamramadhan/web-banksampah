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
import {
  cancelPenukaran,
  confirmPenukaran,
  createPenukaran,
  createSetoran,
  login,
  register,
  searchWarga,
} from "../src/lib/repo";

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
      v instanceof Date
        ? { timestampValue: v.toISOString() }
        : typeof v === "number"
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

// ---------- Penukaran QR (Checkpoint 4) ----------

describe("penukaran vs rules", () => {
  it("alur lengkap: setoran top-up → create pending → warga verified konfirmasi → saldo berkurang persis", async () => {
    // Top-up saldo Budi 10 kg = 50 poin (ops1 sudah ada dari suite setoran).
    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    let warga = (await searchWarga("budi"))[0];
    const saldoAwal = warga.saldoPoin;
    await createSetoran(warga, [{ jenisSampahId: "kardus", jenisSampahNama: "Kardus", beratKg: 10, poin: poinDari(10) }]);
    warga = (await searchWarga("budi"))[0];
    expect(warga.saldoPoin).toBe(saldoAwal + 50);

    // Ops membuat permintaan penukaran 50 poin.
    const id = await createPenukaran(warga, 50);
    const dibuat = await getDoc(doc(db, "penukaran", id));
    expect(dibuat.get("status")).toBe("pending");
    expect(dibuat.get("jumlahRupiah")).toBe(10000);
    const token = dibuat.get("qrToken") as string;
    await signOut(auth);

    // Warga verified scan & konfirmasi.
    await setEmailVerified(warga.uid);
    await signInWithEmailAndPassword(auth, "budi@test.com", "rahasia123");
    const hasil = await confirmPenukaran(token);
    expect(hasil.status).toBe("confirmed");

    const sesudah = await getDoc(doc(db, "users", warga.uid));
    expect(sesudah.get("saldoPoin")).toBe(warga.saldoPoin - 50);
    expect(sesudah.get("lastTxnId")).toBe(id);

    // Replay: token yang sama tidak bisa dipakai dua kali.
    await expect(confirmPenukaran(token)).rejects.toThrow(/sudah diproses/);
    await signOut(auth);
  });

  it("create penukaran di bawah minimum DITOLAK rules", async () => {
    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    const warga = (await searchWarga("budi"))[0];
    const ref = doc(collection(db, "penukaran"));
    await expect(
      setDoc(ref, {
        wargaId: warga.uid,
        wargaNama: warga.nama,
        opsId: auth.currentUser!.uid,
        poinDitukar: 10,
        jumlahRupiah: 2000,
        status: "pending",
        qrToken: crypto.randomUUID(),
        tokenExpiredAt: new Date(Date.now() + 3 * 60_000),
        confirmedAt: null,
        createdAt: serverTimestamp(),
      }),
    ).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("QR kedaluwarsa ditolak dengan pesan ramah", async () => {
    await signInWithEmailAndPassword(auth, "budi@test.com", "rahasia123");
    const uid = auth.currentUser!.uid;
    await signOut(auth);
    await seedDoc("penukaran/expired1", {
      wargaId: uid,
      wargaNama: "Budi Warga",
      opsId: "ops-x",
      poinDitukar: 50,
      jumlahRupiah: 10000,
      status: "pending",
      qrToken: "expired-token-1234567890",
      tokenExpiredAt: new Date(Date.now() - 60_000),
      createdAt: new Date(),
    });
    await signInWithEmailAndPassword(auth, "budi@test.com", "rahasia123");
    await expect(confirmPenukaran("expired-token-1234567890")).rejects.toThrow(/kedaluwarsa/);
    await signOut(auth);
  });

  it("warga BELUM verified ditolak rules saat konfirmasi", async () => {
    await register("Wati Belum Verif", "0899000111", "RT 03", "wati@test.com", "rahasia123");
    const watiUid = auth.currentUser!.uid;
    await signOut(auth);
    // Saldo langsung di-seed (bypass) supaya ops boleh membuat penukaran.
    await seedDoc(`users/${watiUid}`, {
      role: "warga",
      nama: "Wati Belum Verif",
      noHp: "0899000111",
      alamat: "RT 03",
      email: "wati@test.com",
      namaLower: "wati belum verif",
      saldoPoin: 100,
    });

    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    const wati = (await searchWarga("wati"))[0];
    const id = await createPenukaran(wati, 50);
    const token = (await getDoc(doc(db, "penukaran", id))).get("qrToken") as string;
    await signOut(auth);

    await signInWithEmailAndPassword(auth, "wati@test.com", "rahasia123");
    await expect(confirmPenukaran(token)).rejects.toMatchObject({ code: "permission-denied" });
    await signOut(auth);
  });

  it("ops membatalkan penukaran pending", async () => {
    await signInWithEmailAndPassword(auth, "ops1@test.com", "rahasia123");
    const wati = (await searchWarga("wati"))[0];
    const id = await createPenukaran(wati, 50);
    await cancelPenukaran(id);
    expect((await getDoc(doc(db, "penukaran", id))).get("status")).toBe("cancelled");
    await signOut(auth);
  });
});
