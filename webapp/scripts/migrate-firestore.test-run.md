# Gladi bersih: migrate-firestore.ts vs emulator

Tanggal: 2026-07-18
Lingkungan: Firebase Auth+Firestore emulator (root repo, `bank-sampah-kkn`), Postgres test DB
(`websampah_test`, `postgresql://postgres@127.0.0.1:54329/websampah_test`).

## Cara menjalankan

Dari root repo (bukan `webapp/`), karena emulator dan `firebase-tools` ada di root
`node_modules`, dan suite emulator lama (`tests/rules.emu.test.ts`, 13 test) yang menyeed
data ada di root:

```sh
psql -h 127.0.0.1 -p 54329 -U postgres -d websampah_test \
  -c 'TRUNCATE "Penukaran","SetoranItem","Setoran","EmailToken","Session","User" CASCADE'

npx firebase emulators:exec --only auth,firestore \
  "npx vitest run --config vitest.emu.config.ts && \
   cd webapp && \
   DATABASE_URL=postgresql://postgres@127.0.0.1:54329/websampah_test \
     npx tsx scripts/migrate-firestore.ts --emulator"
```

Perintah gabungan ini berhasil dijalankan apa adanya (tidak perlu dipecah manual): emulator
naik, suite `rules.emu.test.ts` (13 test) menyeed Auth+Firestore lewat alur produksi asli
(`register`, `createSetoran`, `createPenukaran`, `confirmPenukaran`, `cancelPenukaran`, plus
`seedDoc`/`setEmailVerified` untuk kasus admin-bypass), lalu skrip migrasi jalan di sesi
emulator yang sama, lalu emulator dimatikan otomatis oleh `emulators:exec`.

Untuk uji idempoten, perintah yang sama diulang dengan skrip migrasi dijalankan **dua kali**
berturut-turut di dalam satu sesi emulator (data emulator sama, DB Postgres tidak di-reset
di antara run 1 dan run 2):

```sh
... && DATABASE_URL=... npx tsx scripts/migrate-firestore.ts --emulator > run1.json && \
       DATABASE_URL=... npx tsx scripts/migrate-firestore.ts --emulator > run2.json && \
       diff run1.json run2.json
```

## Data yang diseed suite emulator lama (13 test, `tests/rules.emu.test.ts`)

Dihitung dari alur test, bukan tebakan:

- **users** (dokumen `users/` yang lolos rules): `budi@test.com` (warga), `ops1@test.com`
  (ops, dibuat via bypass admin `seedDoc`), `wati@test.com` (warga, register lalu
  di-patch saldo 100 via bypass). Dua akun Auth lain (`curang@test.com`, `fakeops@test.com`)
  sengaja **ditolak rules** saat menulis dokumen `users/` (uji negatif) — jadi ada di Auth
  tapi TIDAK punya dokumen Firestore → otomatis tidak ikut termigrasi (skrip mengiterasi
  koleksi `users`, bukan daftar Auth). Total dokumen `users`: **3**.
- **setoran**: 1 dokumen 1.5 kg plastik (+8 poin, Budi) dari test "createSetoran() lolos
  rules", 1 dokumen 10 kg kardus (+50 poin, Budi) dari test "alur lengkap ... top-up". Uji
  negatif "totalPoin curang" ditolak rules (batch gagal, tidak ada dokumen). Total dokumen
  `setoran`: **2**, total poin: **58**.
- **penukaran**: 4 dokumen —
  1. confirmed, Budi, 50 poin (alur lengkap, sudah confirm+replay-ditolak)
  2. pending, `wargaId=budi`, **`opsId="ops-x"`** (dokumen `penukaran/expired1` yang diseed
     langsung via bypass admin REST untuk menguji pesan "QR kedaluwarsa" — `opsId` sengaja
     berupa string palsu, bukan uid Auth sungguhan, karena test itu tidak butuh ops nyata)
  3. pending, Wati, 50 poin (dibuat ops, confirm ditolak rules krn Wati belum verified email)
  4. cancelled, Wati, 50 poin (dibuat ops lalu dibatalkan ops)

  Uji negatif "di bawah minimum" ditolak rules (tidak ada dokumen). Total dokumen
  `penukaran`: **4**.

## Hasil run pertama (DB kosong → migrasi)

```json
{
  "firestore": { "users": 3, "setoran": 2, "penukaran": 4 },
  "migrated": { "users": 3, "setoran": 2, "penukaran": 3 },
  "skipped": { "setoran": 0, "penukaran": 1 },
  "postgres": {
    "users": 3, "totalSaldo": 108,
    "setoran": 2, "totalSetoranPoin": 58,
    "penukaran": 3
  },
  "errors": [
    "penukaran expired1: wargaId/opsId tidak ditemukan di users (wargaId=<uid budi>, opsId=ops-x) — dilewati"
  ]
}
```

Verifikasi silang Firestore → Postgres:

| | Firestore | Postgres (migrated) | Cocok? |
|---|---|---|---|
| users | 3 | 3 | ya |
| setoran | 2 | 2 | ya |
| penukaran | 4 | 3 (1 dilewati, lihat Anomali) | ya, sesuai desain |
| total saldo user | — | 108 | dicek manual di bawah |
| total poin setoran | — | 58 | 8 + 50 |

Cek saldo per user (query langsung ke Postgres setelah run):

| user | saldo_poin |
|---|---|
| Budi Warga | 8 (0 +8 +50 −50 penukaran confirmed) |
| Ops Satu | 0 |
| Wati Belum Verif | 100 (diseed langsung via bypass, 2 penukaran pending/cancelled tidak mengubah saldo) |
| **total** | **108** — cocok dengan `totalSaldo` skrip |

`SetoranItem` count setelah run: **2** (satu item per setoran, sesuai 2 dokumen `setoran`).

## Anomali ditemukan

Satu dokumen `penukaran` (`expired1`) punya `opsId="ops-x"`, yang bukan `uid` Auth/`users`
manapun — artefak sengaja dari test "QR kedaluwarsa ditolak" yang menyeed dokumen langsung
lewat REST admin (bypass rules), bukan lewat `createPenukaran()` produksi. Skema Postgres
punya foreign key `Penukaran.opsId → User.id` (Firestore tidak menegakkan ini), jadi baris
ini **tidak bisa** dimasukkan apa adanya.

Skrip di-adaptasi (di luar draf brief) supaya tidak menghentikan seluruh migrasi karena satu
baris rusak: sebelum upsert `setoran`/`penukaran`, skrip mengecek `wargaId`/`opsId` terhadap
himpunan `users` yang berhasil termigrasi; jika salah satu tidak ada, baris itu dilewati dan
dicatat di array `errors` pada ringkasan akhir (exit code tetap 0, supaya operator meninjau
manual, bukan skrip berhenti paksa di tengah big-bang migration window).

Di data produksi asli hal ini **tidak diharapkan terjadi** — `opsId` selalu diisi
`auth.currentUser.uid` oleh `createPenukaran()`/`createSetoran()` produksi, jadi selalu
menunjuk akun ops yang sungguhan ada. Baris `expired1` murni artefak seed test emulator
lama. Tetap didokumentasikan di sini karena ini justru pembuktian bahwa penjagaan FK/skip
di skrip bekerja seperti dirancang, bukan bug.

Tidak ada anomali lain (tidak ada `setoran` yang dilewati, tidak ada error Prisma lain).

## Uji idempoten (run kedua, tanpa truncate DB di antaranya)

Skrip dijalankan dua kali berturut-turut terhadap data emulator yang sama tanpa mereset
Postgres di antaranya. Output run 1 dan run 2 **identik byte-per-byte** (`diff` kosong):

```json
{
  "firestore": { "users": 3, "setoran": 2, "penukaran": 4 },
  "migrated": { "users": 3, "setoran": 2, "penukaran": 3 },
  "skipped": { "setoran": 0, "penukaran": 1 },
  "postgres": {
    "users": 3, "totalSaldo": 108,
    "setoran": 2, "totalSetoranPoin": 58,
    "penukaran": 3
  },
  "errors": [
    "penukaran expired1: wargaId/opsId tidak ditemukan di users (wargaId=<uid budi>, opsId=ops-x) — dilewati"
  ]
}
```

`SetoranItem` count setelah run kedua: tetap **2** (upsert `create`+`update:{}` memastikan
item nested tidak dibuat ulang pada baris `setoran` yang sudah ada). Tidak ada baris
duplikat pada `User`, `Setoran`, `SetoranItem`, atau `Penukaran` — dicek via `SELECT count(*)`
per tabel sebelum/sesudah run kedua, angkanya sama persis dengan run pertama.

## Efek samping terhadap suite proyek

Setelah gladi bersih (yang menulis ke `websampah_test`), dijalankan ulang:

- `npm run test:db` — **20/20 lulus** (helper `resetDb()` di setiap suite men-`TRUNCATE`
  DB test di awal, jadi data sisa gladi bersih tidak mengganggu).
- `npm test` — **10/10 lulus** (tidak menyentuh DB).
- `npm run build` — bersih, tidak ada error TypeScript; `scripts/` tidak perlu dikecualikan
  dari `tsconfig.json` karena tidak diimpor oleh App Router dan type-check `next build`
  tetap lulus dengan `scripts/migrate-firestore.ts` di dalam project (dicoba dan dipastikan
  hijau, bukan diasumsikan).

## Detail adaptasi dari draf brief

Skrip dasar di brief (`.superpowers/sdd/task-13-brief.md`) dipakai apa adanya untuk
struktur inti (baca Auth → users → setoran+items → penukaran → ringkasan agregat, upsert
by id lama, `update: {}` untuk idempoten). Perubahan yang ditambahkan:

1. **Guard FK sebelum upsert** `setoran`/`penukaran` terhadap himpunan `users` yang berhasil
   termigrasi (lihat "Anomali" di atas) — brief tidak menyebutkan ini secara eksplisit,
   tapi diperlukan karena Postgres menegakkan foreign key yang Firestore tidak.
2. **try/catch per dokumen** di semua loop (bukan hanya guard FK) supaya satu baris rusak
   lain (mis. tipe data tak terduga) tidak menghentikan seluruh migrasi big-bang; error
   dikumpulkan ke array `errors` dan dicetak di akhir, bukan disembunyikan.
3. **Ringkasan lebih lengkap**: mencetak jumlah dokumen Firestore per koleksi *dan* jumlah
   yang berhasil/terlewati di Postgres, bukan cuma agregat Postgres — supaya gladi bersih
   bisa memverifikasi silang tanpa harus query manual (walau tetap diverifikasi manual di
   atas untuk laporan ini).
4. **`main().catch()`** ditambahkan (brief hanya punya `.then()`) supaya error tak tertangani
   membuat proses keluar dengan exit code 1, bukan silently hang/UnhandledPromiseRejection.

Tidak ada perubahan pada pemetaan field (nama field Firestore dicek cocok persis dengan
`src/lib/repo.ts` di root repo: `wargaId`, `opsId`, `poinDitukar`, `jumlahRupiah`, `status`,
`qrToken`, `tokenExpiredAt`, `confirmedAt`, `createdAt`, `items[].{jenisSampahId,
jenisSampahNama, beratKg, poin}` — semua sudah persis sama dengan draf brief).
