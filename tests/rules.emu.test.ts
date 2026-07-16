// Verifikasi format tulis client web lolos firestore.rules ASLI (emulator, bukan produksi).
// Jalankan: npm run test:emu  (emulator dinyalakan oleh firebase emulators:exec)
import { beforeAll, describe, expect, it } from "vitest";
import { connectAuthEmulator, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/lib/firebase";
import { login, register } from "../src/lib/repo";

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
