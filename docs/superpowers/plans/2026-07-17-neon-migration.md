# Migrasi Neon Postgres + Next.js — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite web Bank Sampah dari Vite+Firestore menjadi Next.js+Neon Postgres (Prisma), dengan auth sendiri dan migrasi data big-bang, tanpa aplikasi Android (pensiun).

**Architecture:** Satu app Next.js 15 App Router di `webapp/` (app Vite lama tetap di root sampai cutover). Server Actions untuk semua mutasi, Server Components untuk read, satu route handler GET untuk polling status penukaran. Semua akses DB lewat `webapp/src/lib/*`; invarian firestore.rules pindah ke transaksi Postgres + CHECK constraint.

**Tech Stack:** Next.js 15 (App Router, TS), Prisma 6, Neon Postgres, @node-rs/argon2, firebase-scrypt (verifikasi hash lama), Resend (email), vitest.

## Global Constraints

- Tarif hardcode: `TARIF_POIN_PER_KG = 5`, `RUPIAH_PER_POIN = 200`, `MIN_TUKAR_POIN = 50`; poin = `Math.round(beratKg * 5)` — HARUS identik dengan data lama.
- Semua UI bahasa Indonesia; tema "daun & emas" dipertahankan (port `src/theme.css` lama).
- Registrasi publik selalu role `warga` saldo 0; akun ops hanya via seed.
- Saldo tidak pernah negatif: constraint DB `CHECK (saldo_poin >= 0)` + logika transaksi.
- Konfirmasi penukaran hanya oleh warga pemilik yang emailnya terverifikasi, saat pending & belum expire.
- Referensi perilaku lama: `src/lib/repo.ts`, `src/pages/*` (repo ini), dan `tests/rules.emu.test.ts` (13 kasus yang harus punya padanan Postgres).
- Node 22+. Semua perintah dijalankan dari `webapp/` kecuali disebut lain.
- Env (di `webapp/.env`, JANGAN commit): `DATABASE_URL`, `DATABASE_URL_TEST`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `FIREBASE_SCRYPT_SIGNER_KEY`, `FIREBASE_SCRYPT_SALT_SEPARATOR`, `FIREBASE_SCRYPT_ROUNDS`, `FIREBASE_SCRYPT_MEM_COST`.

---

### Task 1: Scaffold Next.js + tooling

**Files:**
- Create: `webapp/` (via create-next-app), `webapp/vitest.config.ts`, `webapp/.env.example`
- Modify: `.gitignore` (root — tambah `webapp/.env`)

**Interfaces:**
- Produces: struktur `webapp/src/app`, skrip npm `dev|build|test|test:db`.

- [ ] **Step 1: Scaffold + dependency**

```bash
cd /home/kevin/clcode/websampah
npx create-next-app@latest webapp --ts --app --src-dir --no-tailwind --no-eslint --import-alias "@/*" --use-npm
cd webapp
npm i @prisma/client @node-rs/argon2 firebase-scrypt resend qrcode jsqr
npm i -D prisma vitest @types/qrcode
npm pkg set scripts.test="vitest run --project unit" scripts.test:db="vitest run --project db"
```

- [ ] **Step 2: Konfigurasi vitest dua project (unit vs integrasi DB)**

```ts
// webapp/vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    projects: [
      { test: { name: "unit", include: ["src/**/*.test.ts"] } },
      { test: { name: "db", include: ["tests/db/**/*.test.ts"], fileParallelism: false, testTimeout: 20000 } },
    ],
  },
});
```

- [ ] **Step 3: `.env.example` berisi semua nama env dari Global Constraints (nilai kosong), dan tambahkan `webapp/.env` ke `.gitignore` root**

- [ ] **Step 4: Verifikasi**

Run: `npm run dev` → halaman default Next tampil di :3000. `npm test` → "no tests" exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A webapp ../.gitignore && git commit -m "feat(webapp): scaffold Next.js + vitest untuk migrasi Neon"
```

---

### Task 2: Skema Prisma + constraint + harness test DB

**Files:**
- Create: `webapp/prisma/schema.prisma`, `webapp/src/lib/db.ts`, `webapp/tests/db/helpers.ts`, `webapp/tests/db/schema.test.ts`

**Interfaces:**
- Produces: `prisma` singleton (`@/lib/db`); model `User, Session, EmailToken, Setoran, SetoranItem, Penukaran`; helper test `resetDb()`.

- [ ] **Step 1: Tulis schema**

```prisma
// webapp/prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql", url = env("DATABASE_URL") }

enum Role { warga ops }
enum PenukaranStatus { pending confirmed cancelled }
enum TokenType { verify reset }

model User {
  id              String    @id @default(uuid())
  role            Role      @default(warga)
  nama            String
  noHp            String
  alamat          String
  email           String    @unique
  saldoPoin       Int       @default(0) @map("saldo_poin")
  passwordHash    String?
  firebaseHash    String?
  firebaseSalt    String?
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  sessions        Session[]
  emailTokens     EmailToken[]
  setoranSbgWarga Setoran[]    @relation("SetoranWarga")
  setoranSbgOps   Setoran[]    @relation("SetoranOps")
  penukaranSbgWarga Penukaran[] @relation("PenukaranWarga")
  penukaranSbgOps   Penukaran[] @relation("PenukaranOps")
}

model Session {
  token     String   @id
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmailToken {
  token     String    @id
  userId    String
  type      TokenType
  expiresAt DateTime
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Setoran {
  id        String   @id @default(uuid())
  wargaId   String
  opsId     String
  totalPoin Int
  tanggal   DateTime @default(now())
  warga     User     @relation("SetoranWarga", fields: [wargaId], references: [id])
  ops       User     @relation("SetoranOps", fields: [opsId], references: [id])
  items     SetoranItem[]
  @@index([wargaId, tanggal(sort: Desc)])
  @@index([opsId, tanggal(sort: Desc)])
}

model SetoranItem {
  id              String  @id @default(uuid())
  setoranId       String
  jenisSampahId   String
  jenisSampahNama String
  beratKg         Float
  poin            Int
  setoran         Setoran @relation(fields: [setoranId], references: [id], onDelete: Cascade)
}

model Penukaran {
  id             String          @id @default(uuid())
  wargaId        String
  opsId          String
  poinDitukar    Int
  jumlahRupiah   Int
  status         PenukaranStatus @default(pending)
  qrToken        String          @unique @default(uuid())
  tokenExpiredAt DateTime
  confirmedAt    DateTime?
  createdAt      DateTime        @default(now())
  warga          User            @relation("PenukaranWarga", fields: [wargaId], references: [id])
  ops            User            @relation("PenukaranOps", fields: [opsId], references: [id])
  @@index([wargaId, createdAt(sort: Desc)])
  @@index([opsId, createdAt(sort: Desc)])
}
```

- [ ] **Step 2: Migration + CHECK constraint**

```bash
npx prisma migrate dev --name init --create-only
```
Tambahkan di akhir file SQL migration yang dihasilkan:
```sql
ALTER TABLE "User" ADD CONSTRAINT saldo_nonnegatif CHECK ("saldo_poin" >= 0);
```
Lalu: `npx prisma migrate dev`

- [ ] **Step 3: Singleton + helper test**

```ts
// webapp/src/lib/db.ts
import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
```

```ts
// webapp/tests/db/helpers.ts — test DB memakai DATABASE_URL_TEST
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST!;
import { prisma } from "@/lib/db";
export { prisma };
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "Penukaran","SetoranItem","Setoran","EmailToken","Session","User" CASCADE`);
}
export function buatUser(over: Partial<{ role: "warga" | "ops"; email: string; saldoPoin: number; emailVerifiedAt: Date | null }> = {}) {
  return prisma.user.create({ data: {
    role: over.role ?? "warga", nama: "Budi Warga", noHp: "0812345678", alamat: "RT 01",
    email: over.email ?? `u${crypto.randomUUID()}@test.com`,
    saldoPoin: over.saldoPoin ?? 0, emailVerifiedAt: over.emailVerifiedAt ?? null,
  }});
}
```

- [ ] **Step 4: Test failing → pass — constraint menolak saldo negatif**

```ts
// webapp/tests/db/schema.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";

beforeEach(resetDb);

describe("constraint saldo", () => {
  it("saldo negatif DITOLAK database", async () => {
    const u = await buatUser({ saldoPoin: 10 });
    await expect(
      prisma.user.update({ where: { id: u.id }, data: { saldoPoin: -1 } }),
    ).rejects.toThrow(/saldo_nonnegatif|constraint/i);
  });
});
```
Sebelum menjalankan: `DATABASE_URL="$DATABASE_URL_TEST" npx prisma migrate deploy`.
Run: `npm run test:db` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(webapp): skema Prisma + CHECK saldo + harness test DB"`

---

### Task 3: Port konstanta domain + unit test

**Files:**
- Create: `webapp/src/lib/constants.ts`, `webapp/src/lib/constants.test.ts`, `webapp/src/lib/format.ts`, `webapp/src/lib/format.test.ts`

- [ ] **Step 1:** Salin `src/lib/constants.ts` lama apa adanya, **hapus** `currentSeason` (leaderboard kini agregat SQL on-demand). Salin `fmtTanggal`+`sisaDetik` dari `src/lib/format.ts` lama, ganti parameter `Timestamp` menjadi `Date`:

```ts
// webapp/src/lib/format.ts
export function fmtTanggal(d?: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function sisaDetik(sampai?: Date | null, sekarang: number = Date.now()): number {
  if (!sampai) return 0;
  return Math.max(0, Math.ceil((sampai.getTime() - sekarang) / 1000));
}
```

- [ ] **Step 2:** Salin test lama `src/lib/constants.test.ts` + `format.test.ts` (sesuaikan `Date` alih-alih `Timestamp`; hapus test season). Run: `npm test` → PASS (≥9 test).

- [ ] **Step 3: Commit** — `git commit -m "feat(webapp): port konstanta tarif + format (poin identik lama)"`

---

### Task 4: Modul password (argon2 + fallback scrypt Firebase)

**Files:**
- Create: `webapp/src/lib/password.ts`, `webapp/tests/db/password.test.ts`

**Interfaces:**
- Produces: `hashPassword(pw: string): Promise<string>`; `verifyAndUpgradePassword(userId: string, pw: string): Promise<boolean>` — coba argon2; kalau user hanya punya hash Firebase, verifikasi scrypt lalu re-hash ke argon2 dan kosongkan kolom firebase.

- [ ] **Step 1: Test failing**

```ts
// webapp/tests/db/password.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { hashPassword, verifyAndUpgradePassword } from "@/lib/password";

beforeEach(resetDb);

describe("password", () => {
  it("hash argon2 terverifikasi; password salah ditolak", async () => {
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("rahasia123") } });
    expect(await verifyAndUpgradePassword(u.id, "rahasia123")).toBe(true);
    expect(await verifyAndUpgradePassword(u.id, "salah")).toBe(false);
  });
  it("hash Firebase lama terverifikasi lalu di-upgrade ke argon2", async () => {
    // Fixture dibuat dengan firebase-scrypt memakai param test (env FIREBASE_SCRYPT_* di .env.test)
    const { FirebaseScrypt } = await import("firebase-scrypt");
    const scrypt = new FirebaseScrypt({
      signerKey: process.env.FIREBASE_SCRYPT_SIGNER_KEY!,
      saltSeparator: process.env.FIREBASE_SCRYPT_SALT_SEPARATOR!,
      rounds: Number(process.env.FIREBASE_SCRYPT_ROUNDS),
      memCost: Number(process.env.FIREBASE_SCRYPT_MEM_COST),
    });
    const salt = Buffer.from("garam-tes").toString("base64");
    const hash = await scrypt.hash("passwordlama", salt);
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { firebaseHash: hash, firebaseSalt: salt } });

    expect(await verifyAndUpgradePassword(u.id, "passwordlama")).toBe(true);
    const sesudah = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(sesudah.passwordHash).toBeTruthy();   // sudah argon2
    expect(sesudah.firebaseHash).toBeNull();     // hash lama dibuang
    expect(await verifyAndUpgradePassword(u.id, "passwordlama")).toBe(true); // jalur argon2
  });
});
```
Run: `npm run test:db` → FAIL (modul belum ada).

- [ ] **Step 2: Implementasi**

```ts
// webapp/src/lib/password.ts
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { FirebaseScrypt } from "firebase-scrypt";
import { prisma } from "./db";

export const hashPassword = (pw: string) => argonHash(pw);

const scrypt = () =>
  new FirebaseScrypt({
    signerKey: process.env.FIREBASE_SCRYPT_SIGNER_KEY!,
    saltSeparator: process.env.FIREBASE_SCRYPT_SALT_SEPARATOR!,
    rounds: Number(process.env.FIREBASE_SCRYPT_ROUNDS),
    memCost: Number(process.env.FIREBASE_SCRYPT_MEM_COST),
  });

export async function verifyAndUpgradePassword(userId: string, pw: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return false;
  if (u.passwordHash) return argonVerify(u.passwordHash, pw);
  if (u.firebaseHash && u.firebaseSalt) {
    const ok = await scrypt().verify(pw, u.firebaseSalt, u.firebaseHash);
    if (ok) {
      // Upgrade transparan: warga tidak sadar ada migrasi.
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(pw), firebaseHash: null, firebaseSalt: null },
      });
    }
    return ok;
  }
  return false;
}
```
Buat `webapp/.env.test` (di-gitignore) dengan param scrypt dummy utk test: `FIREBASE_SCRYPT_SIGNER_KEY=dGVzdC1zaWduZXIta2V5` `FIREBASE_SCRYPT_SALT_SEPARATOR=Qg==` `FIREBASE_SCRYPT_ROUNDS=8` `FIREBASE_SCRYPT_MEM_COST=14`; muat via `dotenv` di vitest config (`import "dotenv/config"` + `envFile`), atau `env` di project db.

- [ ] **Step 3:** Run `npm run test:db` → PASS. **Commit** `feat(webapp): password argon2 + upgrade transparan dari scrypt Firebase`

---

### Task 5: Session cookie

**Files:**
- Create: `webapp/src/lib/session.ts`, `webapp/tests/db/session.test.ts`

**Interfaces:**
- Produces: `createSession(userId): Promise<string>` (return token; caller yang set cookie), `getUserByToken(token): Promise<User|null>` (null jika expired), `deleteSession(token)`, konstanta `SESSION_COOKIE = "bs_session"`, `SESSION_TTL_HARI = 30`; wrapper Next `getSessionUser()`, `requireRole(role): Promise<User>` (redirect `/login` bila tidak sah).

- [ ] **Step 1: Test failing** — buat user, `createSession`, `getUserByToken` mengembalikan user; token acak lain → null; session yang `expiresAt` lampau (update manual) → null dan terhapus.

```ts
// webapp/tests/db/session.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { createSession, deleteSession, getUserByToken } from "@/lib/session";

beforeEach(resetDb);

describe("session", () => {
  it("token valid → user; token asal → null", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    expect((await getUserByToken(token))?.id).toBe(u.id);
    expect(await getUserByToken("ngawur")).toBeNull();
  });
  it("session expired → null dan dibersihkan", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    await prisma.session.update({ where: { token }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await getUserByToken(token)).toBeNull();
    expect(await prisma.session.findUnique({ where: { token } })).toBeNull();
  });
  it("deleteSession mencabut akses", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    await deleteSession(token);
    expect(await getUserByToken(token)).toBeNull();
  });
});
```

- [ ] **Step 2: Implementasi**

```ts
// webapp/src/lib/session.ts
import { randomBytes } from "node:crypto";
import { prisma } from "./db";

export const SESSION_COOKIE = "bs_session";
export const SESSION_TTL_HARI = 30;

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { token, userId, expiresAt: new Date(Date.now() + SESSION_TTL_HARI * 86_400_000) },
  });
  return token;
}

export async function getUserByToken(token: string) {
  const s = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!s) return null;
  if (s.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return s.user;
}

export const deleteSession = (token: string) =>
  prisma.session.deleteMany({ where: { token } }).then(() => {});
```

```ts
// tambahan di file yang sama — wrapper Next (tidak diuji unit; dipakai pages)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";

export async function getSessionUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? getUserByToken(token) : null;
}
export async function requireRole(role: Role): Promise<User> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (u.role !== role) redirect(u.role === "ops" ? "/ops" : "/warga");
  return u;
}
```
Catatan: `next/headers` membuat file ini hanya bisa di-import dari server — itu memang desainnya. Supaya test db tetap jalan, pisahkan wrapper Next ke `webapp/src/lib/session-next.ts` jika import `next/headers` mengganggu vitest.

- [ ] **Step 3:** `npm run test:db` → PASS. **Commit** `feat(webapp): session cookie berbasis tabel`

---

### Task 6: Token email (verify/reset) + Resend

**Files:**
- Create: `webapp/src/lib/email.ts`, `webapp/tests/db/email-token.test.ts`

**Interfaces:**
- Produces: `createEmailToken(userId, type): Promise<string>` (TTL 1 jam), `consumeEmailToken(token, type): Promise<User|null>` (sekali pakai; verify → set `emailVerifiedAt`), `sendVerification(user)`, `sendReset(user)` (kirim via Resend ke `APP_URL/verifikasi?token=` / `APP_URL/reset?token=`; pengiriman TIDAK diuji otomatis).

- [ ] **Step 1: Test failing** — consume token valid mengembalikan user & (utk verify) mengisi `emailVerifiedAt`; token dipakai dua kali → null; token expired → null; type salah → null.

```ts
// webapp/tests/db/email-token.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { consumeEmailToken, createEmailToken } from "@/lib/email";

beforeEach(resetDb);

describe("email token", () => {
  it("verify: sekali pakai dan menandai emailVerifiedAt", async () => {
    const u = await buatUser();
    const t = await createEmailToken(u.id, "verify");
    const hasil = await consumeEmailToken(t, "verify");
    expect(hasil?.id).toBe(u.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).emailVerifiedAt).toBeTruthy();
    expect(await consumeEmailToken(t, "verify")).toBeNull(); // replay
  });
  it("expired dan type salah → null", async () => {
    const u = await buatUser();
    const t = await createEmailToken(u.id, "reset");
    expect(await consumeEmailToken(t, "verify")).toBeNull(); // type salah
    await prisma.emailToken.update({ where: { token: t }, data: { expiresAt: new Date(Date.now() - 1) } });
    expect(await consumeEmailToken(t, "reset")).toBeNull();
  });
});
```

- [ ] **Step 2: Implementasi**

```ts
// webapp/src/lib/email.ts
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import type { TokenType, User } from "@prisma/client";
import { prisma } from "./db";

export async function createEmailToken(userId: string, type: TokenType): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.emailToken.create({
    data: { token, userId, type, expiresAt: new Date(Date.now() + 3_600_000) },
  });
  return token;
}

export async function consumeEmailToken(token: string, type: TokenType): Promise<User | null> {
  const t = await prisma.emailToken.findUnique({ where: { token }, include: { user: true } });
  if (!t || t.type !== type || t.expiresAt < new Date()) return null;
  await prisma.emailToken.delete({ where: { token } }); // sekali pakai
  if (type === "verify") {
    return prisma.user.update({ where: { id: t.userId }, data: { emailVerifiedAt: new Date() } });
  }
  return t.user;
}

const resend = () => new Resend(process.env.RESEND_API_KEY);
const kirim = (to: string, subject: string, html: string) =>
  resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject, html });

export async function sendVerification(user: User) {
  const t = await createEmailToken(user.id, "verify");
  await kirim(user.email, "Verifikasi email Bank Sampah",
    `<p>Halo ${user.nama}, klik untuk verifikasi: <a href="${process.env.APP_URL}/verifikasi?token=${t}">Verifikasi Email</a> (berlaku 1 jam)</p>`);
}
export async function sendReset(user: User) {
  const t = await createEmailToken(user.id, "reset");
  await kirim(user.email, "Reset password Bank Sampah",
    `<p>Halo ${user.nama}, klik untuk reset password: <a href="${process.env.APP_URL}/reset?token=${t}">Reset Password</a> (berlaku 1 jam)</p>`);
}
```

- [ ] **Step 3:** `npm run test:db` → PASS. **Commit** `feat(webapp): token email verify/reset sekali pakai + Resend`

---

### Task 7: Setoran + pencarian warga (jalur uang #1)

**Files:**
- Create: `webapp/src/lib/setoran.ts`, `webapp/tests/db/setoran.test.ts`

**Interfaces:**
- Consumes: `poinDari`, `JENIS_SAMPAH` (Task 3); `prisma` (Task 2).
- Produces:
  - `createSetoran(ops: User, wargaId: string, entri: { jenis: string; beratKg: number }[]): Promise<{ id: string; totalPoin: number }>` — throw `Error` bila ops.role !== "ops" / entri kosong / berat ≤ 0.
  - `searchWarga(q: string): Promise<Pick<User,"id"|"nama"|"noHp"|"saldoPoin">[]>` — role warga, `ILIKE 'q%'` nama ATAU prefix noHp, limit 12.
  - `setoranPage(by: "wargaId"|"opsId", id: string, cursor?: string): Promise<{ items: (Setoran & { items: SetoranItem[] })[]; nextCursor: string | null }>` — 20/halaman, cursor = id item terakhir (keyset via tanggal+id).
  - `penukaranPage(by, id, cursor)` bentuk sama (implement di Task 8 tapi deklarasikan tipe `Page<T>` di sini).

- [ ] **Step 1: Test failing**

```ts
// webapp/tests/db/setoran.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { createSetoran, searchWarga, setoranPage } from "@/lib/setoran";

beforeEach(resetDb);
const ops = () => buatUser({ role: "ops", email: "ops@test.com" });

describe("createSetoran", () => {
  it("atomik: dokumen + item + saldo bertambah persis (1,5 kg = 8 poin)", async () => {
    const o = await ops();
    const w = await buatUser();
    const { totalPoin } = await createSetoran(o, w.id, [{ jenis: "Plastik", beratKg: 1.5 }]);
    expect(totalPoin).toBe(8);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: w.id } })).saldoPoin).toBe(8);
    const s = await prisma.setoran.findFirstOrThrow({ include: { items: true } });
    expect(s.items[0]).toMatchObject({ jenisSampahId: "plastik", jenisSampahNama: "Plastik", beratKg: 1.5, poin: 8 });
  });
  it("warga tidak bisa jadi pelaku setoran", async () => {
    const w = await buatUser();
    await expect(createSetoran(w, w.id, [{ jenis: "Plastik", beratKg: 1 }])).rejects.toThrow(/ops/i);
  });
});

describe("searchWarga", () => {
  it("prefix nama case-insensitive, prefix noHp, ops tersaring", async () => {
    await ops();
    const w = await buatUser({ email: "budi@test.com" });
    expect((await searchWarga("bud")).map((x) => x.id)).toContain(w.id);
    expect((await searchWarga("0812")).map((x) => x.id)).toContain(w.id);
    expect(await searchWarga("ops")).toHaveLength(0);
  });
});

describe("setoranPage", () => {
  it("20 per halaman + kursor lanjutan", async () => {
    const o = await ops();
    const w = await buatUser();
    for (let i = 0; i < 25; i++) await createSetoran(o, w.id, [{ jenis: "Plastik", beratKg: 1 }]);
    const p1 = await setoranPage("wargaId", w.id);
    expect(p1.items).toHaveLength(20);
    expect(p1.nextCursor).toBeTruthy();
    const p2 = await setoranPage("wargaId", w.id, p1.nextCursor!);
    expect(p2.items).toHaveLength(5);
    expect(p2.nextCursor).toBeNull();
  });
});
```

- [ ] **Step 2: Implementasi**

```ts
// webapp/src/lib/setoran.ts
import type { User } from "@prisma/client";
import { poinDari } from "./constants";
import { prisma } from "./db";

export const PAGE_SIZE = 20;
export interface Page<T> { items: T[]; nextCursor: string | null }

export async function createSetoran(ops: User, wargaId: string, entri: { jenis: string; beratKg: number }[]) {
  if (ops.role !== "ops") throw new Error("Hanya ops yang boleh mencatat setoran");
  if (entri.length === 0) throw new Error("Minimal satu jenis sampah");
  if (entri.some((e) => e.beratKg <= 0)) throw new Error("Berat harus > 0");
  const items = entri.map((e) => ({
    jenisSampahId: e.jenis.toLowerCase(), jenisSampahNama: e.jenis,
    beratKg: e.beratKg, poin: poinDari(e.beratKg),
  }));
  const totalPoin = items.reduce((a, i) => a + i.poin, 0);
  const hasil = await prisma.$transaction(async (tx) => {
    const s = await tx.setoran.create({ data: { wargaId, opsId: ops.id, totalPoin, items: { create: items } } });
    await tx.user.update({ where: { id: wargaId }, data: { saldoPoin: { increment: totalPoin } } });
    return s;
  });
  return { id: hasil.id, totalPoin };
}

export function searchWarga(q: string) {
  const t = q.trim();
  if (!t) return Promise.resolve([]);
  return prisma.user.findMany({
    where: { role: "warga", OR: [{ nama: { startsWith: t, mode: "insensitive" } }, { noHp: { startsWith: t } }] },
    select: { id: true, nama: true, noHp: true, saldoPoin: true },
    orderBy: { nama: "asc" }, take: 12,
  });
}

export async function setoranPage(by: "wargaId" | "opsId", id: string, cursor?: string) {
  const items = await prisma.setoran.findMany({
    where: { [by]: id }, include: { items: true },
    orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    take: PAGE_SIZE, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  return { items, nextCursor: items.length === PAGE_SIZE ? items.at(-1)!.id : null };
}
```

- [ ] **Step 3:** `npm run test:db` → PASS. **Commit** `feat(webapp): setoran atomik + pencarian warga + pagination keyset`

---

### Task 8: Penukaran QR (jalur uang #2)

**Files:**
- Create: `webapp/src/lib/penukaran.ts`, `webapp/tests/db/penukaran.test.ts`

**Interfaces:**
- Consumes: `MIN_TUKAR_POIN`, `RUPIAH_PER_POIN` (Task 3); `Page` (Task 7).
- Produces:
  - `createPenukaran(ops: User, wargaId: string, poin: number): Promise<Penukaran>` — validasi: ops, int, ≥ 50, ≤ saldo warga; `tokenExpiredAt = now + 3 menit`.
  - `confirmPenukaran(warga: User, qrToken: string): Promise<Penukaran>` — throw pesan Indonesia utk: bukan milik/tak ada ("QR tidak valid…"), belum verified ("Verifikasi email…"), sudah diproses, kedaluwarsa. Atomik: `updateMany WHERE id AND status='pending'` + decrement saldo dalam satu transaksi.
  - `cancelPenukaran(ops: User, id: string): Promise<void>` — hanya pending.
  - `getPenukaran(id): Promise<Penukaran|null>`; `penukaranPage(by, id, cursor)` seperti setoranPage (orderBy createdAt).

- [ ] **Step 1: Test failing** — padanan 5 kasus emulator lama:

```ts
// webapp/tests/db/penukaran.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { cancelPenukaran, confirmPenukaran, createPenukaran } from "@/lib/penukaran";

beforeEach(resetDb);
const siap = async () => ({
  ops: await buatUser({ role: "ops", email: "ops@test.com" }),
  warga: await buatUser({ saldoPoin: 58, emailVerifiedAt: new Date() }),
});

describe("penukaran", () => {
  it("alur lengkap: create pending → confirm → saldo berkurang persis; replay ditolak", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    expect(p).toMatchObject({ status: "pending", jumlahRupiah: 10000 });
    const hasil = await confirmPenukaran(warga, p.qrToken);
    expect(hasil.status).toBe("confirmed");
    expect((await prisma.user.findUniqueOrThrow({ where: { id: warga.id } })).saldoPoin).toBe(8);
    await expect(confirmPenukaran(warga, p.qrToken)).rejects.toThrow(/sudah diproses/);
  });
  it("di bawah minimum dan melebihi saldo DITOLAK saat create", async () => {
    const { ops, warga } = await siap();
    await expect(createPenukaran(ops, warga.id, 10)).rejects.toThrow(/[Mm]inimal/);
    await expect(createPenukaran(ops, warga.id, 100)).rejects.toThrow(/saldo/i);
  });
  it("QR kedaluwarsa ditolak", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    await prisma.penukaran.update({ where: { id: p.id }, data: { tokenExpiredAt: new Date(Date.now() - 1000) } });
    await expect(confirmPenukaran(warga, p.qrToken)).rejects.toThrow(/kedaluwarsa/);
  });
  it("warga belum verified ditolak; QR milik orang lain ditolak", async () => {
    const { ops } = await siap();
    const belum = await buatUser({ saldoPoin: 100, emailVerifiedAt: null, email: "wati@test.com" });
    const p = await createPenukaran(ops, belum.id, 50);
    await expect(confirmPenukaran(belum, p.qrToken)).rejects.toThrow(/[Vv]erifikasi/);
    const lain = await buatUser({ saldoPoin: 100, emailVerifiedAt: new Date(), email: "lain@test.com" });
    await expect(confirmPenukaran(lain, p.qrToken)).rejects.toThrow(/tidak valid/);
  });
  it("cancel hanya utk pending", async () => {
    const { ops, warga } = await siap();
    const p = await createPenukaran(ops, warga.id, 50);
    await cancelPenukaran(ops, p.id);
    expect((await prisma.penukaran.findUniqueOrThrow({ where: { id: p.id } })).status).toBe("cancelled");
    await expect(cancelPenukaran(ops, p.id)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Implementasi**

```ts
// webapp/src/lib/penukaran.ts
import type { User } from "@prisma/client";
import { MIN_TUKAR_POIN, RUPIAH_PER_POIN } from "./constants";
import { prisma } from "./db";
import { PAGE_SIZE } from "./setoran";

export const TOKEN_UMUR_MENIT = 3;

export async function createPenukaran(ops: User, wargaId: string, poin: number) {
  if (ops.role !== "ops") throw new Error("Hanya ops yang boleh membuat penukaran");
  if (!Number.isInteger(poin) || poin < MIN_TUKAR_POIN) throw new Error(`Minimal penukaran ${MIN_TUKAR_POIN} poin`);
  const warga = await prisma.user.findUniqueOrThrow({ where: { id: wargaId } });
  if (poin > warga.saldoPoin) throw new Error(`Saldo warga hanya ${warga.saldoPoin} poin`);
  return prisma.penukaran.create({
    data: {
      wargaId, opsId: ops.id, poinDitukar: poin, jumlahRupiah: poin * RUPIAH_PER_POIN,
      tokenExpiredAt: new Date(Date.now() + TOKEN_UMUR_MENIT * 60_000),
    },
  });
}

export async function confirmPenukaran(warga: User, qrToken: string) {
  if (!warga.emailVerifiedAt) throw new Error("Verifikasi email dulu sebelum menukar poin");
  const p = await prisma.penukaran.findUnique({ where: { qrToken } });
  if (!p || p.wargaId !== warga.id) throw new Error("QR tidak valid atau bukan untuk akun Anda");
  if (p.status !== "pending") throw new Error("Penukaran ini sudah diproses. Minta ops membuat QR baru.");
  if (p.tokenExpiredAt < new Date()) throw new Error("QR sudah kedaluwarsa. Minta ops membuat ulang.");
  return prisma.$transaction(async (tx) => {
    // Guard atomik anti-replay: hanya satu transaksi yang lolos WHERE status='pending'.
    const { count } = await tx.penukaran.updateMany({
      where: { id: p.id, status: "pending" },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
    if (count === 0) throw new Error("Penukaran ini sudah diproses. Minta ops membuat QR baru.");
    await tx.user.update({ where: { id: warga.id }, data: { saldoPoin: { decrement: p.poinDitukar } } });
    return tx.penukaran.findUniqueOrThrow({ where: { id: p.id } });
  });
}

export async function cancelPenukaran(ops: User, id: string) {
  if (ops.role !== "ops") throw new Error("Hanya ops");
  const { count } = await prisma.penukaran.updateMany({
    where: { id, status: "pending" }, data: { status: "cancelled" },
  });
  if (count === 0) throw new Error("Penukaran sudah tidak pending");
}

export const getPenukaran = (id: string) => prisma.penukaran.findUnique({ where: { id } });

export async function penukaranPage(by: "wargaId" | "opsId", id: string, cursor?: string) {
  const items = await prisma.penukaran.findMany({
    where: { [by]: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  return { items, nextCursor: items.length === PAGE_SIZE ? items.at(-1)!.id : null };
}
```

- [ ] **Step 3:** `npm run test:db` → PASS (semua money-path). **Commit** `feat(webapp): penukaran QR atomik anti-replay + pagination`

---

### Task 9: Server actions auth + halaman auth + tema

**Files:**
- Create: `webapp/src/app/globals.css` (port `src/theme.css` lama APA ADANYA), `webapp/src/lib/actions/auth.ts`, `webapp/src/app/(auth)/login/page.tsx`, `webapp/src/app/(auth)/register/page.tsx`, `webapp/src/app/(auth)/verifikasi/page.tsx`, `webapp/src/app/(auth)/reset/page.tsx`, `webapp/src/app/layout.tsx`
- Test: manual (form) — logika inti sudah teruji di Task 4–6.

**Interfaces:**
- Produces (semua `"use server"`, return `{ error?: string }` atau redirect):
  - `registerAction(fd: FormData)` — buat user warga saldo 0 + `sendVerification` + login (createSession + cookie) + redirect `/warga`; email duplikat → `{ error: "Email ini sudah terdaftar. Silakan login." }`.
  - `loginAction(fd)` — cari by email, `verifyAndUpgradePassword`, session, redirect by role; gagal → `{ error: "Email atau password salah." }`.
  - `logoutAction()`, `requestResetAction(fd)`, `resetPasswordAction(fd)` (token + password baru), `resendVerificationAction()` (cooldown 60 dtk via kolom `EmailToken.expiresAt` terakhir — cek token verify termuda < 60 dtk lalu tolak), `verifyEmailAction(token)` → `consumeEmailToken`.

- [ ] **Step 1:** `layout.tsx` import `globals.css`, `<html lang="id">`, metadata title "Bank Sampah KKN", `themeColor "#2B6B3F"`.
- [ ] **Step 2:** Implement `auth.ts` — contoh inti login:

```ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyAndUpgradePassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_TTL_HARI, createSession, deleteSession } from "@/lib/session";
import { sendVerification } from "@/lib/email";

async function pasangSession(userId: string) {
  const token = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_HARI * 86_400,
  });
}

export async function loginAction(fd: FormData): Promise<{ error?: string }> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await verifyAndUpgradePassword(u.id, password))) {
    return { error: "Email atau password salah." };
  }
  await pasangSession(u.id);
  redirect(u.role === "ops" ? "/ops" : "/warga");
}

export async function registerAction(fd: FormData): Promise<{ error?: string }> {
  const nama = String(fd.get("nama") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (nama.length < 1 || nama.length > 100) return { error: "Nama wajib diisi (maks. 100 huruf)." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  try {
    const u = await prisma.user.create({ data: {
      nama, email, noHp: String(fd.get("noHp") ?? "").trim(), alamat: String(fd.get("alamat") ?? "").trim(),
      passwordHash: await hashPassword(password), // role default warga, saldo default 0
    }});
    await sendVerification(u).catch(() => {}); // gagal kirim ≠ gagal daftar; ada tombol kirim ulang
    await pasangSession(u.id);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { error: "Email ini sudah terdaftar. Silakan login." };
    throw e;
  }
  redirect("/warga");
}
```
(`logoutAction`, `requestResetAction`, `resetPasswordAction`, `resendVerificationAction`, `verifyEmailAction` mengikuti pola sama memakai modul Task 5–6.)
- [ ] **Step 3:** Port `src/pages/Login.tsx` & `Register.tsx` lama menjadi client components yang memanggil actions via `useActionState`; markup/kelas CSS dipertahankan. Halaman `verifikasi` & `reset` = form kecil baru dengan pola sama.
- [ ] **Step 4:** Verifikasi manual: daftar → user muncul di Neon (prisma studio), cookie terpasang, login ops seed jalan. Run `npm run build` bersih.
- [ ] **Step 5: Commit** `feat(webapp): auth lengkap (register/login/verify/reset) + tema daun & emas`

---

### Task 10: Halaman warga (dashboard + scan QR)

**Files:**
- Create: `webapp/src/app/warga/page.tsx`, `webapp/src/app/warga/scan/page.tsx`, `webapp/src/lib/actions/warga.ts`, komponen client `webapp/src/components/{SaldoCard,RiwayatList,VerifikasiBanner,ScanQr}.tsx`

**Interfaces:**
- Consumes: `requireRole("warga")`, `setoranPage/penukaranPage("wargaId", …)`, `confirmPenukaran`.
- Produces: server action `confirmScanAction(qrToken: string): Promise<{ ok: true; rupiah: number; poin: number } | { error: string }>`; action `muatSetoranAction(cursor)` / `muatPenukaranAction(cursor)` untuk "Muat lebih banyak".

- [ ] **Step 1:** `warga/page.tsx` (Server Component): `const user = await requireRole("warga")` → render `SaldoCard` (port markup lama), `VerifikasiBanner` (tampil bila `!user.emailVerifiedAt`; tombol kirim ulang → `resendVerificationAction`), halaman pertama riwayat via `setoranPage`, tab client `RiwayatList` yang memanggil action utk halaman berikut. Tombol Scan disabled bila belum verified.
- [ ] **Step 2:** Port `src/pages/ScanQr.tsx` lama ke `components/ScanQr.tsx` — bagian kamera + jsQR/BarcodeDetector **disalin utuh**; ganti `confirmPenukaran(token)` Firestore dengan `confirmScanAction(token)`; pesan error dari `{ error }`.
- [ ] **Step 3:** Saldo segar setelah aksi: panggil `router.refresh()` setelah confirm sukses; tidak ada polling di halaman warga.
- [ ] **Step 4:** Manual dua akun (seed ops + warga): scan QR dari layar ops (Task 11) belum ada — uji sementara dengan memanggil `confirmScanAction` via tombol dev; build bersih.
- [ ] **Step 5: Commit** `feat(webapp): dashboard warga + scan QR (kamera port dari app lama)`

---

### Task 11: Halaman ops (beranda, setoran, penukaran QR + polling)

**Files:**
- Create: `webapp/src/app/ops/page.tsx`, `webapp/src/app/ops/setoran/page.tsx`, `webapp/src/app/ops/penukaran/page.tsx`, `webapp/src/app/api/penukaran/[id]/route.ts`, `webapp/src/lib/actions/ops.ts`, komponen `webapp/src/components/{WargaSearch,QrFullscreen}.tsx`

**Interfaces:**
- Produces actions: `cariWargaAction(q)`, `simpanSetoranAction(fd)` (wargaId, jenis, berat string koma → `parseBerat`), `buatPenukaranAction(wargaId, poin)`, `batalkanPenukaranAction(id)`.
- Route handler: `GET /api/penukaran/[id]` → `{ status, poinDitukar, jumlahRupiah, wargaNama, tokenExpiredAt }` (403 bila session bukan ops) — di-poll `QrFullscreen` tiap 2 dtk menggantikan `onSnapshot`.

- [ ] **Step 1:** Port `WargaSearch` lama (debounce 300 ms) → panggil `cariWargaAction`. Port `OpsSetoran` → `simpanSetoranAction` (server memvalidasi ulang berat via `parseBerat`+`poinDari`).
- [ ] **Step 2:** Port `QrFullscreen` lama utuh (qrcode canvas + countdown `sisaDetik`); sumber status = polling fetch `/api/penukaran/[id]` (bukan snapshot). Encode `qrToken` persis seperti lama.
- [ ] **Step 3:** `ops/page.tsx` port beranda lama (tab Masuk/Keluar, `setoranPage/penukaranPage("opsId", …)`).
- [ ] **Step 4:** Uji end-to-end dua browser: ops buat QR → warga scan → layar ops berubah "Terkonfirmasi" ≤ 2 dtk; alur expire → Buat Ulang/Batalkan. Build bersih.
- [ ] **Step 5: Commit** `feat(webapp): halaman ops lengkap + polling status QR`

---

### Task 12: Welcome + PWA + seed ops

**Files:**
- Create: `webapp/src/app/page.tsx` (welcome), `webapp/src/components/InstallPrompt.tsx`, `webapp/src/lib/install.ts`, `webapp/public/manifest.webmanifest`, `webapp/public/icon-*.png` (salin dari `public/` lama), `webapp/prisma/seed.ts`

- [ ] **Step 1:** Port `src/lib/install.ts` + `InstallPrompt` + `Welcome` lama (localStorage, standalone, iOS) — hanya ganti navigasi ke `next/navigation`. Unit test `shouldShowWelcome` ikut dipindah.
- [ ] **Step 2:** Manifest statis di `public/` + `<link rel="manifest">` via metadata Next; service worker MINIMAL: tidak ada (Next + Vercel sudah HTTPS & cepat; installability butuh manifest + ikon — cek dengan Lighthouse. Jika Lighthouse menuntut SW, tambah `@serwist/next` konfigurasi default).
- [ ] **Step 3:** `prisma/seed.ts` — buat akun ops dari env `SEED_OPS_EMAIL`/`SEED_OPS_PASSWORD` (argon2), `npx prisma db seed`.
- [ ] **Step 4:** Lighthouse: installable ✓. `npm test` + `npm run test:db` + build bersih.
- [ ] **Step 5: Commit** `feat(webapp): welcome + install PWA + seed ops`

---

### Task 13: Skrip migrasi data + gladi bersih vs emulator

**Files:**
- Create: `webapp/scripts/migrate-firestore.ts`, `webapp/scripts/migrate-firestore.test-run.md`

**Interfaces:**
- Consumes: firebase-admin (service account JSON via env `GOOGLE_APPLICATION_CREDENTIALS`), Prisma.
- Produces: CLI `npx tsx scripts/migrate-firestore.ts [--emulator]` — idempoten (upsert by id lama).

- [ ] **Step 1: Tulis skrip**

```ts
// webapp/scripts/migrate-firestore.ts
// Big-bang: baca Auth (hash scrypt) + Firestore → Neon. Jalankan saat sistem dibekukan.
// --emulator: pakai FIRESTORE_EMULATOR_HOST/FIREBASE_AUTH_EMULATOR_HOST utk gladi bersih.
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { prisma } from "../src/lib/db";

const emu = process.argv.includes("--emulator");
if (emu) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
}
initializeApp(emu ? { projectId: "bank-sampah-kkn" } : { credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!) });
const db = getFirestore();

async function main() {
  // 1. Auth: email → {hash, salt}
  const hashes = new Map<string, { hash: string | null; salt: string | null }>();
  let page = await getAuth().listUsers(1000);
  for (;;) {
    for (const u of page.users) {
      hashes.set(u.uid, {
        hash: u.passwordHash ? Buffer.from(u.passwordHash).toString() : null,
        salt: u.passwordSalt ? Buffer.from(u.passwordSalt).toString() : null,
      });
    }
    if (!page.pageToken) break;
    page = await getAuth().listUsers(1000, page.pageToken);
  }
  // 2. users
  for (const d of (await db.collection("users").get()).docs) {
    const x = d.data();
    const h = hashes.get(d.id);
    await prisma.user.upsert({
      where: { id: d.id },
      create: {
        id: d.id, role: x.role, nama: x.nama, noHp: x.noHp ?? "", alamat: x.alamat ?? "",
        email: x.email, saldoPoin: x.saldoPoin,
        firebaseHash: h?.hash ?? null, firebaseSalt: h?.salt ?? null,
        emailVerifiedAt: new Date(), // semua user lama dianggap sudah verified (gate lama menjaminnya utk penukar)
        createdAt: x.createdAt?.toDate() ?? new Date(),
      },
      update: {},
    });
  }
  // 3. setoran + items
  for (const d of (await db.collection("setoran").get()).docs) {
    const x = d.data();
    await prisma.setoran.upsert({
      where: { id: d.id },
      create: {
        id: d.id, wargaId: x.wargaId, opsId: x.opsId, totalPoin: x.totalPoin,
        tanggal: x.tanggal?.toDate() ?? new Date(),
        items: { create: (x.items ?? []).map((i: Record<string, unknown>) => ({
          jenisSampahId: i.jenisSampahId, jenisSampahNama: i.jenisSampahNama,
          beratKg: i.beratKg, poin: i.poin,
        })) },
      },
      update: {},
    });
  }
  // 4. penukaran
  for (const d of (await db.collection("penukaran").get()).docs) {
    const x = d.data();
    await prisma.penukaran.upsert({
      where: { id: d.id },
      create: {
        id: d.id, wargaId: x.wargaId, opsId: x.opsId, poinDitukar: x.poinDitukar,
        jumlahRupiah: x.jumlahRupiah, status: x.status, qrToken: x.qrToken,
        tokenExpiredAt: x.tokenExpiredAt?.toDate() ?? new Date(0),
        confirmedAt: x.confirmedAt?.toDate() ?? null, createdAt: x.createdAt?.toDate() ?? new Date(),
      },
      update: {},
    });
  }
  // 5. Verifikasi: total saldo == Σsetoran − Σpenukaran confirmed? (informasi saja — data lama bisa punya koreksi manual)
  const [users, setoran, penukaran] = await Promise.all([
    prisma.user.aggregate({ _sum: { saldoPoin: true }, _count: true }),
    prisma.setoran.aggregate({ _sum: { totalPoin: true }, _count: true }),
    prisma.penukaran.count(),
  ]);
  console.log({ users: users._count, totalSaldo: users._sum.saldoPoin, setoran: setoran._count, penukaran });
}
main().then(() => process.exit(0));
```

- [ ] **Step 2: Gladi bersih** — dari root repo lama: `npm run test:emu` pernah menyeed emulator; untuk gladi, jalankan emulator (`npx firebase emulators:start --only auth,firestore` di root), seed via satu run test emulator lama, lalu `npx tsx scripts/migrate-firestore.ts --emulator` dengan `DATABASE_URL_TEST`. Assert manual: jumlah user/setoran/penukaran di output = jumlah di emulator UI/test, dan total saldo cocok.
- [ ] **Step 3:** Catat hasil gladi di `migrate-firestore.test-run.md` (angka sebelum/sesudah).
- [ ] **Step 4: Commit** `feat(webapp): skrip migrasi Firestore→Neon (idempoten) + hasil gladi emulator`

---

### Task 14: Deploy Vercel + runbook cutover

**Files:**
- Create: `webapp/README.md` (dev/env/deploy/runbook), Modify: `firebase.json` (root — redirect Hosting→Vercel SAAT cutover, belum sekarang)

- [ ] **Step 1:** Vercel project: root directory `webapp`, env production (DATABASE_URL Neon prod, RESEND, APP_URL, FIREBASE_SCRYPT_* dari Console → Authentication → sign-in method → password hash parameters). `vercel deploy` preview → smoke test login/setoran di preview DB (Neon branch).
- [ ] **Step 2:** Tulis runbook di README:
  1. Umumkan beku (malam, 1 jam);
  2. `npx tsx scripts/migrate-firestore.ts` (service account, DATABASE_URL prod);
  3. Smoke test di URL Vercel: login warga lama (password lama!), saldo cocok, setoran + QR end-to-end;
  4. Alihkan: `firebase.json` hosting → `"redirects": [{ "source": "**", "destination": "https://<app>.vercel.app", "type": 301 }]` + `firebase deploy --only hosting`;
  5. Rollback (jika gagal): batalkan redirect — Firestore tidak pernah disentuh skrip (read-only).
- [ ] **Step 3:** **BERHENTI — cutover produksi butuh sign-off manusia eksplisit.** Jangan jalankan langkah runbook ke produksi dari plan ini.
- [ ] **Step 4: Commit** `docs(webapp): runbook cutover + konfigurasi deploy`

---

## Self-Review (sudah dijalankan penulis plan)

- Cakupan spec: skema ✓ (T2), invarian 1–6 ✓ (T2/T7/T8/T9/seed), pemetaan query ✓ (T7/T8/T10/T11), auth+scrypt ✓ (T4/T9), email ✓ (T6), realtime→polling ✓ (T11), PWA ✓ (T12), migrasi+gladi ✓ (T13), cutover ✓ (T14). Leaderboard: tanpa tabel — tidak ada task karena tidak ada halamannya (sesuai spec).
- Konsistensi tipe: `Page<T>`/`PAGE_SIZE` didefinisikan T7 dipakai T8; `SESSION_COOKIE` T5 dipakai T9; `poinDari` T3 dipakai T7.
- Tanpa placeholder: setiap task punya kode/perintah konkret; task porting menunjuk file sumber lama yang eksak.
