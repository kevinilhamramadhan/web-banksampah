# Bank Sampah KKN — Website PWA

Versi web (PWA) dari aplikasi Android [BankSampah](https://github.com/kevinilhamramadhan/BankSampah). Memakai Firebase project yang sama (`bank-sampah-kkn`): Auth, Firestore, rules, dan index yang sudah ter-deploy — website ini murni client, tanpa server.

- **Warga**: registrasi, pantau saldo poin realtime, riwayat, scan QR penukaran.
- **Ops**: input setoran sampah (poin otomatis), proses penukaran poin via QR tatap muka.
- Tarif hardcode: 1 kg = 5 poin, 1 poin = Rp 200, pencairan min. 50 poin (`src/lib/constants.ts`).

## Stack

Vite + React + TypeScript, Firebase JS SDK (Auth + Firestore), vite-plugin-pwa, `qrcode` (generate QR ops), `BarcodeDetector`/jsQR (scan kamera warga). Tanpa Cloud Functions — keamanan ditegakkan `firestore.rules` (salinan referensi ada di repo ini, **jangan deploy ulang dari sini**).

## Pengembangan

```bash
npm install
npm run dev        # http://localhost:5173 (kamera jalan di localhost)
npm test           # unit test (vitest)
npm run test:emu   # test integrasi vs rules asli di emulator (butuh Java)
npm run build      # output dist/
npm run lint       # oxlint
```

## Konfigurasi Firebase

`src/lib/firebase.ts` berisi `firebaseConfig` Web App **"Bank Sampah Web"** yang sudah terdaftar di project `bank-sampah-kkn` (bukan rahasia, aman di-commit). Kalau perlu membuat ulang: Firebase Console → Project settings → General → Add app → Web, lalu salin confignya ke file itu.

## Deploy

### Manual

```bash
npx firebase login
npm run build
npx firebase deploy --only hosting   # JANGAN deploy tanpa --only hosting
```

### Otomatis (GitHub Actions)

Setiap push ke `main` menjalankan test + build + deploy (`.github/workflows/deploy.yml`). Sekali setup:

1. Firebase Console → Project settings → **Service accounts** → Generate new private key.
2. GitHub repo → Settings → Secrets and variables → Actions → buat secret **`FIREBASE_SERVICE_ACCOUNT`** berisi seluruh isi file JSON tersebut.

(Alternatif: `npx firebase init hosting:github` membuat service account + secret otomatis.)

## Struktur

```
src/lib          firebase.ts (init), constants.ts (tarif), repo.ts (semua akses Firestore,
                 port 1:1 dari Repo.kt Android — format tulis divalidasi rules)
src/pages        Welcome, Login, Register, Warga, Ops, OpsSetoran, OpsPenukaran, ScanQr
src/components   SaldoCard, WargaSearch, RiwayatList, QrFullscreen, InstallPrompt, VerifikasiBanner
tests/           test integrasi emulator (rules asli)
firestore.rules  salinan REFERENSI dari repo Android — sumber kebenaran ada di sana
```

Detail kebutuhan: `spec.md` dan `prompt-bank-sampah-pwa.md`; rencana kerja: `tasks/`.
