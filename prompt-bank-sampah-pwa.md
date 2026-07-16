# Prompt untuk Claude Code — Bank Sampah Digital (Website PWA + Firebase)

## Konteks Proyek

Ini versi **website PWA** dari aplikasi Android "Bank Sampah KKN" yang sudah jalan (repo: github.com/kevinilhamramadhan/BankSampah). Proyek KKN, bukan produksi enterprise — prioritas: **jalan, gampang diakses warga, tidak over-engineered, dan biaya Rp 0**. Tidak ada VPS, tidak ada backend sendiri: website bicara langsung ke Firebase (paket Spark / free tier), di-hosting gratis di **Firebase Hosting**.

**PENTING — backend sudah ada dan dipakai bersama aplikasi Android.** Website ini memakai **Firebase project yang sama** (`bank-sampah-kkn`): Auth, Firestore, security rules, dan composite index sudah ter-deploy dan TIDAK boleh diubah. Data warga/poin harus konsisten: warga yang setor lewat pendataan ops di Android harus melihat saldonya di website, dan sebaliknya. Tugasmu murni membangun client web yang mengikuti skema dan rules yang sudah ada (keduanya disalin lengkap di bawah).

Sistem dipakai dua aktor:

- **Warga**: memantau poin sampah yang dikumpulkan, menukar poin jadi uang.
- **Ops** (pengelola bank sampah): mendata sampah masuk (poin otomatis), memproses penukaran poin.

Penukaran poin **wajib tatap muka**, diwujudkan lewat QR code (alur persis di bawah).

## Halaman Awal: Pilih Cara Pakai (khusus versi web)

Saat pertama kali membuka website (belum login, belum pernah memilih), tampilkan layar sambutan dengan dua pilihan besar:

1. **"Gunakan di Browser"** → langsung lanjut ke halaman login/registrasi.
2. **"Install Aplikasi"** → jelaskan singkat keuntungannya (buka dari home screen, layar penuh, lebih cepat), lalu:
   - Chrome/Edge Android: trigger prompt install PWA via event `beforeinstallprompt` (simpan event-nya, panggil `prompt()` saat tombol ditekan).
   - iOS Safari (tidak ada `beforeinstallprompt`): tampilkan instruksi manual bergambar "Bagikan → Tambahkan ke Layar Utama".
   - Browser yang tidak mendukung: sembunyikan tombol install, tampilkan pilihan browser saja.

Simpan pilihan di `localStorage` supaya layar ini tidak muncul lagi (tapi sediakan tombol kecil "Install aplikasi" di halaman akun/pengaturan bagi yang berubah pikiran). Kalau app sudah berjalan dalam mode standalone (`display-mode: standalone`), lewati layar ini sepenuhnya.

## Tech Stack

- **Frontend**: Vite + React + TypeScript (SPA). Boleh vanilla JS kalau menurutmu lebih sederhana, tapi jangan Next.js/SSR — tidak ada server.
- **UI**: CSS sendiri atau library ringan — JANGAN bawa framework UI berat. Ikuti tema visual aplikasi Android-nya: palet "daun & emas" (hijau daun `#2B6B3F`/`#1E5730` untuk aksi, emas `#F2C94C` untuk nilai poin/uang, permukaan kertas hangat `#F6FAF0`), kartu saldo hijau tua gaya kartu bank dengan angka ekstra tebal, sudut membulat 16–20px, tombol aksi tinggi ±52px. Dukung mode gelap via `prefers-color-scheme`.
- **PWA**: manifest.json (name, ikon maskable, `display: standalone`, `theme_color` hijau daun) + service worker untuk cache app shell (pakai `vite-plugin-pwa` biar tidak menulis SW manual). Data Firestore TIDAK perlu offline-first — cukup app shell yang ter-cache; Firestore SDK sudah punya cache bawaan.
- **Auth**: Firebase Authentication (email + password, verifikasi email bawaan) — Firebase JS SDK v9+ modular.
- **Database**: Cloud Firestore — `onSnapshot` untuk realtime, jangan polling.
- **QR generate** (layar ops): library `qrcode` (render ke canvas).
- **QR scan** (kamera warga): `BarcodeDetector` API kalau tersedia, fallback ke `jsQR`/`html5-qrcode` — via `getUserMedia` kamera belakang. Ingat: kamera di web butuh HTTPS (Firebase Hosting sudah HTTPS; saat dev pakai localhost).
- **Hosting/deploy**: Firebase Hosting (`firebase deploy --only hosting`). Sertakan GitHub Actions workflow deploy saat push ke branch utama (pakai secret `FIREBASE_SERVICE_ACCOUNT` / `firebase hosting:channel`), plus dokumentasi deploy manual.

**Batasan free tier**: JANGAN Cloud Functions, jangan server apa pun. Semua logika di client; keamanan sudah ditegakkan `firestore.rules` yang ada.

## Responsif (wajib)

- **Mobile-first** (mayoritas warga pakai HP), tapi harus enak juga di tablet/desktop:
  - ≤ 640px: satu kolom, tombol lebar penuh, tab riwayat.
  - ≥ 900px (ops di laptop): konten maksimal ~720px di tengah, atau dua kolom (form kiri, riwayat kanan) untuk halaman input setoran/penukaran.
- QR full-screen di layar ops harus besar dan kontras di semua ukuran layar (latar putih, QR ≥ 60vmin).
- Sentuhan minimal 44×44px, font dasar 16px, tidak ada horizontal scroll di viewport manapun.

## Aktor & Role

- `warga` — self-registrasi dari website.
- `ops` — akun dibuat manual di Firebase Console (sudah ada; jangan buat alur registrasi ops).

Role di `users/{uid}.role`. Setelah login baca role → arahkan ke UI warga atau ops (route guard).

## Aturan Bisnis (HARDCODE di client — sudah ditegakkan juga di rules)

```
1 kg sampah = Rp 1.000 = 5 poin   →  TARIF_POIN_PER_KG = 5
1 poin = Rp 200                    →  RUPIAH_PER_POIN = 200
Pencairan minimal 50 poin (= Rp 10.000)  →  MIN_TUKAR_POIN = 50
```

Jangan buat halaman admin untuk mengatur tarif — konstanta di satu file (`src/lib/constants.ts`). Jumlah rupiah SELALU dihitung otomatis (`poin × 200`), tidak pernah diketik manual.

## Fitur

### 1. Registrasi & Login Warga
- Form: nama, no HP, alamat/RT-RW, email, password.
- Submit → `createUserWithEmailAndPassword` + buat dokumen `users/{uid}` (role `warga`, `saldoPoin: 0`, `namaLower` lowercase) + `sendEmailVerification()`.
- Scan QR penukaran hanya boleh kalau `emailVerified` — banner "verifikasi email dulu" + tombol kirim ulang (cooldown 60 detik) + tombol "Sudah verifikasi" (reload user).
- Login email+password; lupa password via `sendPasswordResetEmail`.
- Pesan error auth dalam bahasa Indonesia (email sudah terdaftar, password salah, dst).

### 2. Login Ops
- Email + password. Setelah login baca `users/{uid}.role` → UI ops.

### 3. Dashboard Warga
- Kartu saldo (elemen visual utama): saldo poin realtime (`onSnapshot` ke `users/{uid}`), nilai rupiah setara berwarna emas, baris aturan "1 kg sampah = 5 poin • cair min. 50 poin (Rp 10.000)".
- Tab **Setoran** / **Penukaran**: riwayat berhalaman `limit(20)` + tombol "Muat lebih banyak" — JANGAN baca seluruh koleksi.
- Tombol "Scan QR Penukaran Poin" (nonaktif kalau belum verifikasi email).

### 4. Ops — Beranda
- Tombol "Input Setoran Sampah" dan "Penukaran Poin (QR)".
- Baris info tarif.
- Riwayat yang diproses ops ini, dua tab: **Masuk (Setoran)** dan **Keluar (Penukaran)** — masing-masing berhalaman limit 20. (Index komposit `setoran(opsId, tanggal)` dan `penukaran(opsId, createdAt)` sudah ada.)

### 5. Ops — Input Setoran
- Cari warga by nama/no HP: prefix search satu field (`orderBy(field).startAt(q).endAt(q + "")`, limit 12; kalau query diawali angka/`+` cari `noHp`, selain itu `namaLower`), filter `role == "warga"` di client. Debounce 300ms. JANGAN Algolia/full-text.
- Pilih **jenis sampah** — 4 chip pilihan wajib: **Plastik, Logam, Kardus, Lainnya** (tarif sama, flat per kg; jenis hanya dicatat).
- Input berat (kg, terima koma desimal) → preview otomatis "= X poin (tarif 5 poin/kg)".
- Simpan = **satu `writeBatch` atomik**: buat dokumen `setoran` (items array berisi satu item `{jenisSampahId: jenis.toLowerCase(), jenisSampahNama: jenis, beratKg, poin}`) + update user warga `{saldoPoin: increment(totalPoin), lastTxnId: <id dokumen setoran>}`. Field `lastTxnId` WAJIB — rules memvalidasi delta saldo lewat itu.

### 6. Penukaran Poin via QR (fitur inti — ikuti persis)

1. Warga datang ke lokasi, minta tukar poin.
2. Ops buka "Penukaran Poin", cari & pilih warga (komponen pencarian yang sama).
3. Ops isi poin yang ditukar. Validasi client: ≥ 50, ≤ saldo warga; tampilkan "= Rp X tunai" otomatis.
4. "Buat Permintaan Penukaran" → dokumen `penukaran`: status `pending`, `qrToken` = UUID (`crypto.randomUUID()`), `tokenExpiredAt` = sekarang + 3 menit, `jumlahRupiah = poin × 200`, `confirmedAt: null`, `createdAt: serverTimestamp()`.
5. QR (encode `qrToken`) tampil full-screen di layar ops + countdown detik. `onSnapshot` ke dokumen itu.
6. Warga (login di HP sendiri, browser/PWA) buka "Scan QR", kamera nyala, scan layar ops.
7. Client warga query `penukaran` where `qrToken == hasil scan` AND `wargaId == uid sendiri`, limit 1.
8. Jalankan **`runTransaction`**: cek status masih `pending` dan belum expire → update penukaran `{status: "confirmed", confirmedAt: serverTimestamp()}` + update user `{saldoPoin: increment(-poinDitukar), lastTxnId: <id penukaran>}` — atomik.
9. Keamanan sesungguhnya ada di security rules (sudah ter-deploy): pemilik + email verified + pending→confirmed sekali pakai + belum expire + delta saldo persis. Client cukup mengikuti format di atas; kalau rules menolak, tampilkan pesan ramah.
10. Layar ops otomatis berubah "✔ Terkonfirmasi — serahkan uang tunai Rp X" via snapshot.
11. Uang diserahkan cash manual (di luar sistem).
12. Kalau expire sebelum discan: layar ops menampilkan "QR kedaluwarsa" + tombol "Buat Ulang QR" (buat dokumen baru) dan "Batalkan" (update status → `cancelled`).

## Skema Data (Firestore — SUDAH ADA, jangan diubah)

```
users/{uid}
  role: "warga" | "ops"
  nama, noHp, alamat, email
  namaLower                  // untuk prefix search
  saldoPoin: number
  lastTxnId: string          // pointer transaksi terakhir, dipakai rules validasi delta saldo
  createdAt

setoran/{id}
  wargaId, wargaNama, opsId
  items: [ { jenisSampahId, jenisSampahNama, beratKg, poin } ]
  totalPoin: number
  tanggal: timestamp

penukaran/{id}
  wargaId, wargaNama, opsId
  poinDitukar: number
  jumlahRupiah: number        // selalu poinDitukar × 200
  status: "pending" | "confirmed" | "cancelled"
  qrToken: string             // UUID
  tokenExpiredAt: timestamp   // +3 menit
  confirmedAt: timestamp | null
  createdAt: timestamp
```

Composite index yang sudah ada: `setoran(wargaId, tanggal desc)`, `setoran(opsId, tanggal desc)`, `penukaran(wargaId, createdAt desc)`, `penukaran(opsId, createdAt desc)`. Jangan membuat query yang butuh index baru.

## Security Rules (referensi — SUDAH TER-DEPLOY, jangan deploy ulang)

Rules menegakkan: saldo hanya berubah lewat dua jalur atomik (batch setoran oleh ops dengan `lastTxnId` + delta == totalPoin; transaksi konfirmasi penukaran oleh warga dengan delta == poinDitukar), registrasi hanya role `warga` saldo 0, penukaran dibuat ops dengan `poinDitukar >= 50 && jumlahRupiah == poinDitukar * 200 && poinDitukar <= saldo`, konfirmasi hanya pemilik ber-email-verified saat pending & belum expire, default deny. Salin file `firestore.rules` dan `firestore.indexes.json` dari repo Android ke repo ini sebagai referensi/dokumentasi (bukan untuk di-deploy ulang).

Konsekuensi untuk client web: setiap penulisan HARUS mengikuti format batch/transaction persis seperti dijelaskan di fitur 5 & 6 — penulisan yang formatnya beda akan ditolak rules dengan `permission-denied`.

## Struktur Proyek

```
/websampah
  /src
    /lib          → firebase.ts (init), constants.ts (tarif), repo.ts (fungsi Firestore)
    /pages        → Welcome (pilih browser/install), Login, Register, Warga, Ops,
                    OpsSetoran, OpsPenukaran, ScanQr
    /components   → SaldoCard, WargaSearch, RiwayatList, QrFullscreen, InstallPrompt
  /public         → manifest.json, ikon PWA (192/512 + maskable)
  firebase.json   → hosting (public: dist, rewrites SPA ke /index.html)
  firestore.rules / firestore.indexes.json   → salinan referensi dari repo Android
  .github/workflows/deploy.yml
  README.md       → konfigurasi Firebase web app (firebaseConfig), cara dev, build, deploy
```

Config Firebase web: daftarkan **Web App** baru di project `bank-sampah-kkn` yang sama (Console → Add app → Web) untuk mendapat `firebaseConfig`; dokumentasikan langkahnya di README. `firebaseConfig` boleh di-commit (bukan rahasia).

## Batasan & Simplifikasi (wajib dipatuhi)

- SPA satu package, tanpa monorepo, tanpa state-management library (React state/context cukup).
- Jangan Cloud Functions / server / SSR. Jangan dependency untuk hal yang bisa dikerjakan browser API atau Firebase SDK.
- Semua query pakai `limit()` — jaga kuota reads free tier (50k/hari).
- `onSnapshot` untuk realtime (saldo, dokumen penukaran aktif), jangan polling.
- Tidak ada payment gateway — uang cash manual.
- UI bahasa Indonesia semua.
- Testing manual cukup; rules sudah punya suite test sendiri di repo Android.

## Urutan Pengerjaan

1. Scaffold Vite + React + TS, setup Firebase JS SDK, tema CSS (palet daun & emas, dark mode), routing + route guard role.
2. Layar sambutan pilih "Gunakan di Browser" / "Install Aplikasi" + manifest + service worker (vite-plugin-pwa) + `beforeinstallprompt` + instruksi iOS.
3. Auth: registrasi warga + verifikasi email, login, lupa password, routing role.
4. Dashboard warga: kartu saldo realtime + riwayat setoran/penukaran berhalaman.
5. Ops: beranda (tab Masuk/Keluar), input setoran (cari warga, chip jenis, batch atomik).
6. Penukaran QR: form + QR full-screen + countdown + snapshot di ops; scanner kamera + transaction konfirmasi di warga; alur expire/buat ulang/batalkan.
7. Responsive pass (mobile/tablet/desktop) + polish PWA (ikon, splash, standalone).
8. Firebase Hosting deploy + GitHub Actions + README lengkap.

Kalau ada bagian ambigu saat develop, tanya dulu sebelum ambil keputusan besar.
