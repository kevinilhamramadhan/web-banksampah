# Bank Sampah — Web PWA (Next.js + Prisma + Neon)

Pengganti web PWA Bank Sampah KKN. Versi lama (root repo ini, `src/` di luar
`webapp/`) memakai Vite + React + Firebase (Auth + Firestore) — versi itu kini
**dipensiunkan** setelah cutover, digantikan proyek Next.js di folder ini yang
memakai **Prisma + Neon Postgres** sebagai database. Aplikasi Android
(`BankSampah`, repo terpisah) sudah pensiun lebih dulu; web PWA ini adalah
satu-satunya klien yang tersisa untuk warga dan ops.

- **Warga**: registrasi, login, pantau saldo poin, riwayat, scan QR penukaran.
- **Ops**: input setoran sampah (poin otomatis), proses penukaran poin via QR.
- Tarif hardcode: 1 kg = 5 poin, 1 poin = Rp 200 (`src/lib/constants.ts`) — sama
  seperti versi lama, tidak berubah oleh migrasi ini.
- Auth: sesi cookie server-side (`src/lib/session.ts`), password baru di-hash
  Argon2 (`@node-rs/argon2`); password warga lama (Firebase scrypt) diverifikasi
  transparan lalu di-upgrade ke Argon2 saat login pertama pasca-migrasi
  (`src/lib/password.ts`).

## Stack

Next.js 16 (App Router, Turbopack) · Prisma 6 · Neon Postgres (Postgres biasa
untuk dev lokal) · Resend (email verifikasi/reset) · `@node-rs/argon2` (hash
password) · `firebase-scrypt` (verifikasi hash lama, sekali pakai) · `qrcode` /
`jsqr` (QR setoran & penukaran) · Vitest (unit + integrasi DB).

## Dev lokal

### Prasyarat

- Node.js **22+**.
- Postgres lokal. Dua opsi:
  - **Cepat (disarankan untuk dev sehari-hari)** — instance `initdb`/`pg_ctl`
    lokal di port non-default supaya tidak bentrok dengan Postgres sistem:
    ```bash
    initdb -D ~/.local/share/websampah-pg
    pg_ctl -D ~/.local/share/websampah-pg -o "-p 54329" -l ~/.local/share/websampah-pg/log start
    createdb -p 54329 websampah_dev
    createdb -p 54329 websampah_test
    ```
    (Hentikan dengan `pg_ctl -D ~/.local/share/websampah-pg stop`.) Ini yang
    dipakai selama pengembangan Task 1–13 — lihat `DATABASE_URL` di bawah.
  - **Neon branch** — buat branch dev terpisah di project Neon (Neon Console →
    Branches → Create branch), pakai connection string branch itu sebagai
    `DATABASE_URL`. Lebih dekat ke produksi, tapi butuh koneksi internet dan
    lebih lambat untuk iterasi cepat/`test:db`.

### Setup

```bash
cd webapp
npm install
cp .env.example .env   # lalu isi nilai-nilai di bawah
npx prisma migrate dev   # buat schema di DATABASE_URL (websampah_dev)
npx prisma db seed       # buat akun ops awal dari SEED_OPS_*
npm run dev               # http://localhost:3000
```

Test:

```bash
npm test       # unit test (src/**/*.test.ts) — tidak butuh DB
npm run test:db  # integrasi DB (tests/db/**/*.test.ts) — pakai DATABASE_URL_TEST,
                  # truncate semua tabel di awal tiap suite (lihat tests/db/helpers.ts)
```

### Variabel environment (`.env`, dari `.env.example`)

| Var | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string Postgres untuk dev (`websampah_dev`). Contoh lokal: `postgresql://postgres@127.0.0.1:54329/websampah_dev`. |
| `DATABASE_URL_TEST` | Connection string Postgres khusus test (`websampah_test`), **database terpisah** dari dev karena `test:db` men-truncate semua tabel di setiap suite. Contoh lokal: `postgresql://postgres@127.0.0.1:54329/websampah_test`. |
| `RESEND_API_KEY` | API key dari [resend.com](https://resend.com) untuk kirim email verifikasi & reset password. |
| `EMAIL_FROM` | Alamat pengirim email, mis. `Bank Sampah <noreply@domain-anda>`. Domain harus sudah diverifikasi di Resend (lihat Catatan keamanan). |
| `APP_URL` | Base URL aplikasi (dipakai untuk link di email verifikasi/reset). Dev: `http://localhost:3000`. Produksi: URL Vercel atau domain final. |
| `FIREBASE_SCRYPT_SIGNER_KEY` | Parameter hash password Firebase lama, hanya dipakai untuk **memverifikasi** password warga yang belum login sejak migrasi (`src/lib/password.ts`). Ambil dari Firebase Console → Authentication → Sign-in method → scroll ke **Password hash parameters** → *Base64 signer key*. |
| `FIREBASE_SCRYPT_SALT_SEPARATOR` | Dari layar yang sama → *Base64 salt separator*. |
| `FIREBASE_SCRYPT_ROUNDS` | Dari layar yang sama → *Rounds* (angka). |
| `FIREBASE_SCRYPT_MEM_COST` | Dari layar yang sama → *Memory cost* (angka). |
| `GOOGLE_APPLICATION_CREDENTIALS` | **Bukan** untuk aplikasi Next.js — hanya dipakai sekali oleh `scripts/migrate-firestore.ts` (skrip migrasi big-bang, lihat Runbook). Path ke file JSON service account Firebase Admin (Firebase Console → Project settings → Service accounts → Generate new private key). Jangan set di Vercel/produksi aplikasi — cukup di shell lokal/CI saat menjalankan skrip migrasi. |
| `SEED_OPS_EMAIL` | Email akun ops pertama, dibuat oleh `prisma/seed.ts`. |
| `SEED_OPS_PASSWORD` | Password akun ops pertama. **Ganti nilai ini sebelum seed produksi** (lihat Catatan keamanan). |
| `SEED_OPS_NAMA` | Nama tampilan akun ops (opsional, default `"Ops Bank Sampah"`). |

Nilai `FIREBASE_SCRYPT_*` produksi **berbeda** dari yang dipakai saat gladi
bersih emulator (Task 13) — emulator tidak menghitung scrypt sungguhan.
Ambil nilai asli dari Firebase Console (project `bank-sampah-kkn`) saat
cutover, bukan nilai apa pun yang tercatat di riwayat gladi.

## Deploy Vercel

- **Root directory** project Vercel = `webapp` (bukan root repo — root repo
  berisi aplikasi lama Vite yang sudah pensiun).
- **Build command**: default Next.js (`next build`) — tidak perlu override.
- **Environment variable** yang wajib di-set di Vercel (Project Settings →
  Environment Variables, scope *Production*): `DATABASE_URL`,
  `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, `FIREBASE_SCRYPT_SIGNER_KEY`,
  `FIREBASE_SCRYPT_SALT_SEPARATOR`, `FIREBASE_SCRYPT_ROUNDS`,
  `FIREBASE_SCRYPT_MEM_COST`. (`DATABASE_URL_TEST`, `GOOGLE_APPLICATION_CREDENTIALS`,
  dan `SEED_OPS_*` **tidak perlu** di-set di Vercel — dipakai lokal/CI saja,
  `SEED_OPS_*` hanya untuk `prisma db seed` yang dijalankan manual sekali.)
- **Catatan `@node-rs/argon2`**: ini native module (Rust, N-API) — jalan di
  **Vercel Node.js runtime**, **bukan** Edge runtime. Jangan tambahkan
  `export const runtime = "edge"` di route mana pun yang menyentuh
  `src/lib/password.ts` (langsung maupun transitif lewat `src/lib/actions/*`).
  Verifikasi lokal: `grep -rn 'runtime.*=.*"edge"' src/` harus kosong — sudah
  dicek bersih per commit ini.

## RUNBOOK CUTOVER

Dijalankan manusia, satu kali, saat memindahkan produksi dari app lama
(Firebase Hosting + Firestore) ke web PWA baru (Vercel + Neon). **Jangan
jalankan langkah-langkah ini tanpa sign-off eksplisit** — lihat pengingat di
`.superpowers/sdd/task-14-brief.md`.

1. **Umumkan beku.** Beri tahu warga & ops bahwa sistem beku ±1 jam,
   idealnya malam hari (traffic rendah). Selama beku: jangan ada setoran,
   penukaran, atau registrasi baru di app lama.

2. **Set environment production di Vercel.** Isi semua var di atas dengan
   nilai produksi:
   - `DATABASE_URL` → connection string Neon **project produksi** (bukan
     branch dev/test).
   - `RESEND_API_KEY`, `EMAIL_FROM` → domain terverifikasi.
   - `APP_URL` → domain final (atau URL `*.vercel.app` sementara jika domain
     custom belum siap saat cutover — perbarui lagi begitu domain aktif).
   - `FIREBASE_SCRYPT_*` → nilai **produksi asli** dari Firebase Console
     (project `bank-sampah-kkn`) → Authentication → Sign-in method →
     Password hash parameters.
   - `SEED_OPS_*` (dipakai lokal untuk langkah 3, bukan di Vercel) → ganti
     `SEED_OPS_PASSWORD` dari nilai dev sebelum dipakai.

3. **Terapkan schema + seed ke Neon produksi** (dari lokal/CI, dengan
   `DATABASE_URL` diarahkan ke Neon prod):
   ```bash
   cd webapp
   DATABASE_URL="<neon-prod-url>" npx prisma migrate deploy
   DATABASE_URL="<neon-prod-url>" SEED_OPS_EMAIL=... SEED_OPS_PASSWORD=... SEED_OPS_NAMA=... npx prisma db seed
   ```

4. **Jalankan migrasi data** dari Firestore ke Neon prod:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/ke/service-account.json \
   DATABASE_URL="<neon-prod-url>" \
   npx tsx scripts/migrate-firestore.ts
   ```
   Baca output JSON di akhir dengan teliti, khususnya array `errors`.
   **Jika exit code = 2 (ada baris "dilewati"/anomali di `errors`): STOP.**
   Jangan lanjut ke langkah 5. Tinjau setiap baris di `errors` secara manual
   (bandingkan dengan dokumen Firestore aslinya di Console), putuskan apakah
   aman diabaikan (mis. data uji lama) atau harus diperbaiki dulu sebelum
   melanjutkan. Skrip idempoten (upsert `update: {}`) — aman dijalankan
   ulang setelah perbaikan tanpa menduplikasi baris yang sudah masuk.

5. **Verifikasi angka.** Bandingkan ringkasan JSON dari skrip
   (`postgres.users`, `postgres.totalSaldo`, dst.) dengan Firebase Console:
   - Jumlah user: Authentication → Users (jumlah baris) vs `postgres.users`.
   - Total saldo: jumlahkan manual field `saldoPoin` di Firestore
     `users/*` (atau query admin) vs `postgres.totalSaldo`.
   Selisih yang tidak bisa dijelaskan oleh baris di `errors` = STOP, jangan
   lanjut ke langkah 6.

6. **Smoke test di URL Vercel** (bukan localhost):
   - Login sebagai warga lama memakai **password lama** (membuktikan jalur
     verifikasi scrypt → upgrade Argon2 bekerja).
   - Cek saldo warga tersebut cocok dengan angka yang diverifikasi di
     langkah 5.
   - Setoran uji oleh ops → poin bertambah di akun warga.
   - Penukaran uji end-to-end dengan **dua perangkat** (satu tampilkan QR
     warga, satu scan sebagai ops) → status `confirmed`, saldo berkurang.

7. **Alihkan domain.** Edit `firebase.json` di **root repo** (bukan
   `webapp/`) — tambahkan `hosting.redirects` supaya semua path lama
   diarahkan ke Vercel:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "redirects": [
         {
           "source": "**",
           "destination": "https://<app-anda>.vercel.app",
           "type": 301
         }
       ]
     }
   }
   ```
   (Ganti `<app-anda>.vercel.app` dengan domain final jika sudah aktif.)
   Lalu, dari root repo: `npx firebase deploy --only hosting`.
   Ini adalah perubahan yang **sengaja tidak dibuat oleh task ini** — hanya
   dilakukan manusia, tepat di sini, pada saat cutover sungguhan.

8. **ROLLBACK (jika langkah 4–6 gagal / tidak lolos verifikasi):**
   - Hapus blok `redirects` dari `firebase.json` (root), `npx firebase
     deploy --only hosting` lagi → app lama Vite+Firestore aktif kembali
     seperti semula.
   - Aman dilakukan kapan pun: `scripts/migrate-firestore.ts` **hanya
     membaca** Firestore/Auth (tidak pernah menulis), jadi data lama tetap
     utuh apa pun hasil migrasinya. Baris yang sudah terlanjur masuk ke Neon
     prod boleh dibiarkan (idempoten) atau di-`TRUNCATE` manual sebelum
     percobaan cutover berikutnya.

## Catatan keamanan

- **Ganti `SEED_OPS_PASSWORD`** ke nilai baru & rahasia sebelum menjalankan
  `prisma db seed` di produksi — jangan pakai password dev.
- **Jangan commit `.env`** — sudah di `.gitignore`; `.env.example` hanya
  berisi nama var, tanpa nilai.
- **Resend domain verification**: `EMAIL_FROM` harus pakai domain yang sudah
  diverifikasi di dashboard Resend (SPF/DKIM), kalau tidak email verifikasi/
  reset password akan ditolak atau masuk spam.
- `GOOGLE_APPLICATION_CREDENTIALS` (service account Firebase Admin) hanya
  dipakai sekali saat migrasi — jangan simpan file JSON-nya di repo atau di
  environment Vercel yang persisten.
