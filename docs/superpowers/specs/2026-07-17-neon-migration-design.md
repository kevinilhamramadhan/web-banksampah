# Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js

Status: menunggu review user. Keputusan 1A dan 2A adalah rekomendasi asisten yang belum
dikonfirmasi eksplisit (user melompat ke /writing-plans) — koreksi di sini kalau salah.

## Keputusan (dari sesi brainstorming 2026-07-17)

| Keputusan | Pilihan |
|---|---|
| Aplikasi Android | **Pensiun** — web jadi satu-satunya client; Firestore ditinggalkan setelah cutover |
| Database | Neon Postgres (project sudah ada) |
| Framework | **Rewrite ke Next.js 15 App Router** (TypeScript), deploy Vercel (akun sudah ada) |
| ORM | Prisma |
| Auth | **Ganti total** — password argon2 + session cookie di Postgres; Firebase Auth ditinggalkan |
| Strategi migrasi data | **1A: big-bang, jendela beku singkat** (skala KKN kecil; export→import hitungan menit) |
| Password lama | **2A: import hash scrypt Firebase**, verifikasi via `firebase-scrypt` saat login pertama lalu re-hash ke argon2 — warga tidak perlu reset |
| Email verifikasi/reset | Resend (free tier), token di tabel `EmailToken` |
| Realtime | Diganti polling ringan (layar QR ops poll 2 dtk; saldo refresh on-focus/after-action) |
| Leaderboard | **Tanpa tabel** — agregat SQL per kuartal dari `Setoran` (tetap ditulis? tidak — dihitung on-demand) |

## Arsitektur

Satu aplikasi Next.js di folder `webapp/` (repo ini; app Vite lama tetap ada sampai cutover).
Server Actions untuk mutasi (register, login, setoran, penukaran), Server Components untuk
read, satu route handler GET untuk polling status penukaran. Semua akses DB lewat modul
`src/lib/*` — komponen tidak memanggil Prisma langsung. Seluruh invarian yang dulu ada di
`firestore.rules` pindah ke transaksi Postgres + constraint.

## Skema (Prisma)

- `User`: id uuid, role (warga|ops), nama, noHp, alamat, email unique, saldoPoin int default 0,
  passwordHash (argon2, nullable), firebaseHash+firebaseSalt (scrypt lama, nullable, dihapus
  setelah re-hash), emailVerifiedAt nullable, createdAt. Raw SQL: `CHECK (saldo_poin >= 0)`.
- `Session`: token (pk, random 32 byte), userId, expiresAt (30 hari). Cookie httpOnly.
- `EmailToken`: token pk, userId, type (verify|reset), expiresAt (1 jam), sekali pakai (delete on use).
- `Setoran`: id, wargaId, opsId, totalPoin int, tanggal. `SetoranItem`: setoranId, jenisSampahId,
  jenisSampahNama, beratKg float, poin int.
- `Penukaran`: id, wargaId, opsId, poinDitukar int, jumlahRupiah int, status enum
  (pending|confirmed|cancelled), qrToken uuid unique, tokenExpiredAt, confirmedAt nullable, createdAt.

## Invarian bisnis (pindahan dari firestore.rules → kode server)

1. Saldo hanya berubah di dalam transaksi bersama Setoran (tambah) atau Penukaran confirm (kurang).
2. Setoran: totalPoin = Σ item.poin; poin item = `Math.round(beratKg × 5)` (identik lama); pelaku role ops.
3. Penukaran create (ops): poin ≥ 50, jumlahRupiah = poin × 200, poin ≤ saldo warga, expire +3 menit.
4. Penukaran confirm (warga pemilik, email terverifikasi): hanya saat status pending & belum expire;
   atomik via `UPDATE ... WHERE status='pending'` dalam transaksi; replay/expired ditolak dengan pesan ramah.
5. Registrasi selalu role warga, saldo 0. Akun ops dibuat via seed/SQL manual.
6. Tarif tetap hardcode konstanta (1 kg = 5 poin, 1 poin = Rp 200, min tukar 50 poin).

## Pemetaan query Firestore → SQL/Prisma

| Lama (Firestore) | Baru |
|---|---|
| prefix search namaLower/noHp + filter role client | `WHERE role='warga' AND (nama ILIKE 'q%' OR noHp LIKE 'q%') LIMIT 12` |
| riwayat paginated startAfter/limit 20 | keyset pagination `WHERE (tanggal,id) < (cursor) ORDER BY tanggal DESC LIMIT 20` |
| onSnapshot users/{uid} (saldo) | Server Component + `router.refresh()` after actions / on focus |
| onSnapshot penukaran/{id} (layar QR ops) | GET `/api/penukaran/[id]` di-poll tiap 2 dtk saat QR tampil |
| leaderboard per season | `SELECT warga_id, SUM(total_poin) FROM setoran WHERE tanggal ∈ kuartal GROUP BY 1 ORDER BY 2 DESC` |

## Migrasi data (big-bang)

1. Skrip `scripts/migrate-firestore.ts` (firebase-admin + service account): baca Auth users
   (hash+salt scrypt) + koleksi users/setoran/penukaran → tulis ke Postgres via Prisma.
   ID dokumen lama disimpan apa adanya (kolom id string, uuid untuk data baru).
2. Gladi bersih: jalankan skrip terhadap **emulator** (data seed test) → verifikasi jumlah baris & total saldo.
3. Malam cutover: umumkan beku → jalankan skrip ke produksi Neon → smoke test → alihkan
   Firebase Hosting ke redirect Vercel → selesai. Rollback = batalkan redirect (Firestore tak tersentuh).
4. Parameter scrypt project (signer key dll.) diambil dari Firebase Console → env.

## Testing

- Unit (vitest): poinDari/parseBerat/format (port dari app lama), logika token & session TTL.
- Integrasi (vitest + Postgres test — Neon branch atau lokal, `DATABASE_URL_TEST`): seluruh
  jalur uang — setoran atomik, saldo curang mustahil (constraint), penukaran min/replay/expired/
  unverified/insufficient — padanan 1:1 dengan 13 test emulator lama.
- Migrasi: dry-run terhadap emulator, assert jumlah & saldo.

## Kriteria sukses

1. Semua fitur app lama berfungsi di Next.js (welcome/install PWA, auth, dashboard, setoran, QR).
2. Test integrasi money-path hijau terhadap Postgres nyata.
3. Warga lama bisa login dengan password lama (verifikasi scrypt→argon2 transparan).
4. Data produksi termigrasi: jumlah user/setoran/penukaran & total saldo poin sama persis.
5. App live di Vercel; domain/URL lama mengarah ke app baru; kamera & PWA jalan via HTTPS.

## Di luar scope

Halaman leaderboard (tidak pernah ada di web), fitur baru apa pun, migrasi Android, zero-downtime
dual-write (tidak dibutuhkan di skala ini).
