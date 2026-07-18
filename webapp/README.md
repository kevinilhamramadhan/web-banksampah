# Bank Sampah — Web PWA (Next.js + Prisma + Neon)

Web PWA Bank Sampah KKN: aplikasi mandiri berbasis **Next.js + Prisma + Neon
Postgres**, tanpa Firebase sama sekali. (Versi lama berbasis Vite + Firebase dan
aplikasi Android sudah dipensiunkan; riwayatnya masih ada di git history.
Sistem dimulai dengan **data segar** — warga registrasi baru, saldo mulai 0.)

- **Warga**: registrasi, login, pantau saldo poin, riwayat, scan QR penukaran.
- **Ops**: input setoran sampah (poin otomatis), proses penukaran poin via QR.
- Tarif hardcode: 1 kg = 5 poin, 1 poin = Rp 200, pencairan min. 50 poin
  (`src/lib/constants.ts`).
- Auth: sesi cookie server-side (`src/lib/session.ts`), password di-hash Argon2
  (`src/lib/password.ts`). Verifikasi email & reset password via Resend.

## Stack

Next.js 16 (App Router, Turbopack) · Prisma 6 · Neon Postgres (Postgres biasa
untuk dev lokal) · Resend (email verifikasi/reset) · `@node-rs/argon2` (hash
password) · `qrcode` / `jsqr` (QR penukaran) · Vitest (unit + integrasi DB).

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
    (Hentikan dengan `pg_ctl -D ~/.local/share/websampah-pg stop`.)
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
| `SEED_OPS_EMAIL` | Email akun ops pertama, dibuat oleh `prisma/seed.ts`. |
| `SEED_OPS_PASSWORD` | Password akun ops pertama. **Ganti nilai ini sebelum seed produksi** (lihat Catatan keamanan). |
| `SEED_OPS_NAMA` | Nama tampilan akun ops (opsional, default `"Ops Bank Sampah"`). |

## Deploy Vercel

- **Root directory** project Vercel = `webapp`.
- **Build command**: default Next.js (`next build`) — tidak perlu override.
- **Environment variable** yang wajib di-set di Vercel (Project Settings →
  Environment Variables, scope *Production*): `DATABASE_URL`,
  `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`. (`DATABASE_URL_TEST` dan
  `SEED_OPS_*` **tidak perlu** di Vercel — `SEED_OPS_*` hanya untuk
  `prisma db seed` yang dijalankan manual sekali dari lokal.)
- **Catatan `@node-rs/argon2`**: ini native module (Rust, N-API) — jalan di
  **Vercel Node.js runtime**, **bukan** Edge runtime. Jangan tambahkan
  `export const runtime = "edge"` di route mana pun yang menyentuh
  `src/lib/password.ts` (langsung maupun transitif lewat `src/lib/actions/*`).
  Verifikasi lokal: `grep -rn 'runtime.*=.*"edge"' src/` harus kosong.

## RUNBOOK GO-LIVE

Sistem mulai dari data kosong — tidak ada migrasi data. Urutan peluncuran:

1. **Siapkan Neon produksi.** Dari lokal, dengan connection string Neon prod:
   ```bash
   cd webapp
   DATABASE_URL="<neon-prod-url>" npx prisma migrate deploy
   DATABASE_URL="<neon-prod-url>" SEED_OPS_EMAIL=... SEED_OPS_PASSWORD=... SEED_OPS_NAMA=... npx prisma db seed
   ```
   Ganti `SEED_OPS_PASSWORD` ke nilai rahasia (bukan nilai dev).

2. **Set env production di Vercel** (`DATABASE_URL` Neon prod, `RESEND_API_KEY`,
   `EMAIL_FROM` domain terverifikasi, `APP_URL` = domain final) lalu deploy.

3. **Smoke test di URL Vercel** (bukan localhost):
   - Registrasi warga baru → email verifikasi masuk → klik tombol verifikasi.
   - Login ops (akun seed) → cari warga → setoran uji → saldo warga bertambah.
   - Penukaran uji end-to-end dengan **dua perangkat** (laptop ops tampilkan
     QR, HP warga scan) → status `confirmed`, saldo berkurang.
   - Cek installability PWA (Chrome → menu → Install app / Lighthouse).

4. **Umumkan ke warga.** Bagikan URL; warga lama mendaftar ulang (saldo mulai
   0 — kalau ada saldo lama yang belum dicairkan, ops meng-input ulang lewat
   setoran koreksi sesuai catatan manual).

5. **Rollback**: aplikasi belum menyimpan data penting di awal peluncuran —
   kalau ada masalah fatal, cukup nonaktifkan deployment di Vercel, perbaiki,
   deploy ulang.

## Catatan keamanan

- **Ganti `SEED_OPS_PASSWORD`** ke nilai baru & rahasia sebelum menjalankan
  `prisma db seed` di produksi — jangan pakai password dev.
- **Jangan commit `.env`** — sudah di `.gitignore`; `.env.example` hanya
  berisi nama var, tanpa nilai.
- **Resend domain verification**: `EMAIL_FROM` harus pakai domain yang sudah
  diverifikasi di dashboard Resend (SPF/DKIM), kalau tidak email verifikasi/
  reset password akan ditolak atau masuk spam.
