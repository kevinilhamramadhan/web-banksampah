# Todo: Bank Sampah Digital — Website PWA

## Task 1: Scaffold + tema + routing

**Description:** Vite + React + TS di root repo, dependency inti, struktur folder, tema CSS daun & emas + dark mode, router dengan halaman placeholder, `constants.ts` + `firebase.ts` (config placeholder) + kerangka `repo.ts`.

**Acceptance criteria:**
- [ ] `npm run dev` render app; route `/`, `/login`, `/register`, `/warga`, `/ops` ada (placeholder boleh)
- [ ] `src/lib/constants.ts` berisi `TARIF_POIN_PER_KG=5`, `RUPIAH_PER_POIN=200`, `MIN_TUKAR_POIN=50`, `poinDari()` pakai `Math.round`
- [ ] CSS custom properties palet daun & emas + `prefers-color-scheme: dark`; font dasar 16px
- [ ] Dependency hanya: react, react-dom, react-router-dom, firebase, qrcode, jsqr, vite-plugin-pwa (dev)

**Verification:**
- [ ] `npm run build` bersih
- [ ] `npx vitest run` (atau `node --test`) lulus test `poinDari`: 1,5→8; 1,4→7; 2→10

**Dependencies:** None
**Files likely touched:** scaffold Vite + `src/lib/{constants,firebase,repo}.ts`, `src/theme.css`, `src/App.tsx`
**Estimated scope:** M

## Task 2: Welcome screen + PWA install

**Description:** Layar sambutan "Gunakan di Browser" / "Install Aplikasi" dengan `beforeinstallprompt`, instruksi iOS, persistensi localStorage, skip saat standalone; manifest + ikon + service worker via vite-plugin-pwa.

**Acceptance criteria:**
- [ ] Pilihan tersimpan di localStorage; layar tidak muncul lagi; skip total saat `display-mode: standalone`
- [ ] Chrome: tombol install memanggil `prompt()` dari event tersimpan; iOS Safari: instruksi "Bagikan → Tambahkan ke Layar Utama"; browser lain: tombol install disembunyikan
- [ ] manifest.json: name, ikon 192/512 + maskable, `display: standalone`, `theme_color` hijau daun

**Verification:**
- [ ] `npm run build` bersih; `npx vite preview` → manifest & SW terdaftar (cek devtools Application)
- [ ] Manual: reload kedua tidak menampilkan welcome lagi

**Dependencies:** Task 1
**Files likely touched:** `src/pages/Welcome.tsx`, `src/components/InstallPrompt.tsx`, `vite.config.ts`, `public/` ikon
**Estimated scope:** S

### CHECKPOINT 1 — build bersih, welcome→login jalan, manifest terpasang

## Task 3: Auth warga + login ops + route guard

**Description:** Registrasi warga (createUser + dokumen users sesuai rules + sendEmailVerification), login email/password, lupa password, banner verifikasi (kirim ulang cooldown 60 dtk + tombol "Sudah verifikasi"), pemetaan error auth ke bahasa Indonesia, route guard berdasarkan role, logout.

**Acceptance criteria:**
- [ ] Registrasi membuat `users/{uid}` dengan keys persis: role=`warga`, nama, noHp, alamat, email, namaLower, saldoPoin=0, createdAt(serverTimestamp) — lolos rules
- [ ] Setelah login, role dibaca → redirect `/warga` atau `/ops`; akses silang route di-redirect; belum login → `/login`
- [ ] Error auth umum tampil dalam bahasa Indonesia; reset password terkirim

**Verification:**
- [ ] Manual di Firebase nyata: daftar warga baru → dokumen muncul di Console, email verifikasi masuk; login akun ops eksisting → UI ops
- [ ] `npm run build` bersih

**Dependencies:** Task 1 (+ firebaseConfig asli)
**Files likely touched:** `src/pages/{Login,Register}.tsx`, `src/lib/{repo,auth-errors}.ts`, `src/App.tsx` (guard)
**Estimated scope:** M

### CHECKPOINT 2 — tulis/baca nyata lolos rules untuk auth

## Task 4: Dashboard warga

**Description:** Kartu saldo realtime (onSnapshot users/{uid}) bergaya kartu bank hijau tua, nilai rupiah emas, baris tarif; tab Setoran/Penukaran berhalaman limit 20 + "Muat lebih banyak"; tombol Scan QR (nonaktif jika belum verified).

**Acceptance criteria:**
- [ ] Saldo berubah tanpa reload saat diubah dari jalur lain (uji nanti via T6/Android)
- [ ] Riwayat pakai query berindex: `setoran(wargaId, tanggal desc)`, `penukaran(wargaId, createdAt desc)`, limit 20, startAfter utk halaman berikut
- [ ] Tombol scan disabled + banner verifikasi bila `emailVerified` false

**Verification:**
- [ ] Manual: akun warga dengan data eksisting dari Android menampilkan saldo & riwayat yang sama dengan app Android
- [ ] `npm run build` bersih

**Dependencies:** Task 3
**Files likely touched:** `src/pages/Warga.tsx`, `src/components/{SaldoCard,RiwayatList}.tsx`, `src/lib/repo.ts`
**Estimated scope:** M

## Task 5: Ops beranda

**Description:** Beranda ops: tombol ke Input Setoran & Penukaran QR, baris info tarif, riwayat milik ops ini dua tab (Masuk=setoran, Keluar=penukaran) berhalaman limit 20.

**Acceptance criteria:**
- [ ] Query pakai index `setoran(opsId, tanggal desc)` & `penukaran(opsId, createdAt desc)`, limit 20 + muat lebih banyak
- [ ] Reuse `RiwayatList` dari Task 4 (jangan duplikat)

**Verification:**
- [ ] Manual: login ops → riwayat yang pernah diinput ops itu (dari Android) tampil
- [ ] `npm run build` bersih

**Dependencies:** Task 4 (reuse komponen)
**Files likely touched:** `src/pages/Ops.tsx`, `src/lib/repo.ts`
**Estimated scope:** S

## Task 6: Ops input setoran (jalur uang #1)

**Description:** Pencarian warga prefix (nama/noHp, debounce 300ms, limit 12, filter role di client), chip 4 jenis sampah, input berat terima koma, preview poin, simpan via `writeBatch`: dokumen setoran (items array) + update user (increment saldo, lastTxnId) + leaderboard `{season}__{uid}` merge — persis Repo.kt.

**Acceptance criteria:**
- [ ] Search: query diawali digit/`+` → `noHp`, selain itu `namaLower`; `orderBy().startAt(q).endAt(q+"")`
- [ ] Batch lolos rules; saldo warga bertambah persis totalPoin; leaderboard season format `YYYY-Q#` terisi
- [ ] Berat "1,5" → item `{jenisSampahId:"plastik", jenisSampahNama:"Plastik", beratKg:1.5, poin:8}`

**Verification:**
- [ ] Manual dua tab browser: ops input setoran → dashboard warga (tab lain) saldo naik realtime; cek dokumen di Console (setoran, users.lastTxnId, leaderboard)
- [ ] Unit test `poinDari` masih lulus; `npm run build` bersih

**Dependencies:** Task 5 (dan Task 4 utk verifikasi)
**Files likely touched:** `src/pages/OpsSetoran.tsx`, `src/components/WargaSearch.tsx`, `src/lib/repo.ts`
**Estimated scope:** M

### CHECKPOINT 3 — setoran end-to-end konsisten dengan Android; review manusia sebelum lanjut

## Task 7: Ops — penukaran via QR

**Description:** Pilih warga (reuse WargaSearch), input poin (validasi ≥50, ≤saldo, preview rupiah otomatis), buat dokumen penukaran (pending, qrToken UUID, expire +3 menit, jumlahRupiah=poin×200, confirmedAt null, createdAt serverTimestamp), QR fullscreen (≥60vmin, latar putih) + countdown + onSnapshot; saat expire: "Buat Ulang QR" / "Batalkan" (status→cancelled); saat confirmed: "✔ Terkonfirmasi — serahkan Rp X".

**Acceptance criteria:**
- [ ] Dokumen penukaran lolos rules create (uji nyata); tombol nonaktif bila poin invalid
- [ ] Countdown akurat ke `tokenExpiredAt`; UI berubah otomatis via snapshot (pending→confirmed/cancelled/expired)
- [ ] Buat Ulang membuat dokumen baru dengan token baru; Batalkan update status saja

**Verification:**
- [ ] Manual: buat permintaan → QR tampil; biarkan expire → tombol muncul; batalkan → status di Console `cancelled`
- [ ] `npm run build` bersih

**Dependencies:** Task 6
**Files likely touched:** `src/pages/OpsPenukaran.tsx`, `src/components/QrFullscreen.tsx`, `src/lib/repo.ts`
**Estimated scope:** M

## Task 8: Warga — scan QR + konfirmasi (jalur uang #2)

**Description:** Halaman scan: getUserMedia kamera belakang, `BarcodeDetector` bila ada, fallback jsQR; hasil scan → query penukaran by qrToken+wargaId limit 1 → `runTransaction` (cek pending & belum expire → status confirmed + confirmedAt serverTimestamp + increment saldo −poin + lastTxnId) — persis Repo.kt; pesan error ramah utk semua kegagalan (bukan QR-nya, expired, sudah diproses, permission-denied, belum verified).

**Acceptance criteria:**
- [ ] Scan QR dari layar ops → transaction lolos rules; saldo berkurang persis; layar warga tampil sukses "Rp X"
- [ ] Gate `emailVerified` sebelum kamera nyala; kamera berhenti saat meninggalkan halaman
- [ ] QR expired/sudah confirmed → pesan Indonesia yang jelas, tanpa crash

**Verification:**
- [ ] Manual dua perangkat (HP warga + laptop ops): alur lengkap pending→scan→confirmed; layar ops berubah otomatis; cek saldo di Console
- [ ] `npm run build` bersih

**Dependencies:** Task 7
**Files likely touched:** `src/pages/ScanQr.tsx`, `src/lib/repo.ts`
**Estimated scope:** M

### CHECKPOINT 4 — alur QR dua perangkat lulus; review manusia

## Task 9: Responsive pass + polish PWA

**Description:** Audit semua halaman di ≤640px / ≥900px (ops dua kolom), touch target ≥44px, tanpa horizontal scroll; ikon maskable final, theme_color, splash iOS; QR tetap ≥60vmin di semua layar.

**Acceptance criteria:**
- [ ] Tidak ada horizontal scroll di 320–1440px; layout ops ≥900px dua kolom / maks ~720px terpusat
- [ ] Lighthouse: installable, tanpa error PWA

**Verification:**
- [ ] Manual devtools responsive + HP nyata; Lighthouse PWA pass

**Dependencies:** Tasks 2–8
**Files likely touched:** CSS + penyesuaian kecil halaman
**Estimated scope:** S

## Task 10: Deploy + CI + README

**Description:** `firebase.json` (hosting dist + SPA rewrite), deploy manual `firebase deploy --only hosting`, GitHub Actions deploy on push (secret `FIREBASE_SERVICE_ACCOUNT`), README: cara daftar Web App & isi firebaseConfig, dev, build, deploy.

**Acceptance criteria:**
- [ ] App live di URL Hosting; SPA route langsung (mis. /warga) tidak 404
- [ ] Workflow CI valid (lint yaml); README lengkap langkah config

**Verification:**
- [ ] Buka URL produksi di HP: login + alur inti jalan lewat HTTPS (kamera OK)

**Dependencies:** Task 9
**Files likely touched:** `firebase.json`, `.github/workflows/deploy.yml`, `README.md`
**Estimated scope:** S

### CHECKPOINT FINAL — semua Success Criteria spec.md ✓
