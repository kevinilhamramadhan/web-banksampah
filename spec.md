# Spec: Bank Sampah Digital — Website PWA

> Sumber kebutuhan detail: [prompt-bank-sampah-pwa.md](prompt-bank-sampah-pwa.md) (jangan duplikasi; file ini merangkum + menambah keputusan). Rules & index acuan: `firestore.rules`, `firestore.indexes.json` (sudah ter-deploy, read-only).

## Objective

Client web PWA untuk sistem Bank Sampah KKN yang sudah berjalan di Android, memakai Firebase project `bank-sampah-kkn` yang sama (Auth + Firestore + rules yang sudah ada). Dua aktor: **warga** (pantau poin, tukar poin via scan QR) dan **ops** (input setoran, proses penukaran via QR). Sukses = warga bisa registrasi/login/lihat saldo realtime/scan QR penukaran dari HP, ops bisa input setoran & buat QR penukaran dari browser, data konsisten dengan aplikasi Android, biaya Rp 0.

## Tech Stack

- Vite + React 18 + TypeScript (SPA), React Router untuk routing + route guard role.
- Firebase JS SDK v9+ modular (Auth email/password + verifikasi email, Firestore `onSnapshot`).
- `vite-plugin-pwa` (manifest + service worker app-shell), `qrcode` (generate), `BarcodeDetector` dengan fallback `jsQR` (scan).
- CSS sendiri (custom properties), palet daun & emas, dark mode via `prefers-color-scheme`. Tanpa framework UI, tanpa state-management lib.
- Hosting: Firebase Hosting + GitHub Actions deploy.

## Commands

```
Dev:    npm run dev            # localhost (kamera OK di localhost)
Build:  npm run build          # output dist/
Lint:   npm run lint           # eslint (bawaan template vite)
Deploy: firebase deploy --only hosting
```

## Project Structure

Sesuai bagian "Struktur Proyek" di prompt: `src/lib` (firebase.ts, constants.ts, repo.ts), `src/pages`, `src/components`, `public/` (manifest+ikon), `firebase.json`, `.github/workflows/deploy.yml`.

## Code Style

```ts
// src/lib/repo.ts — semua akses Firestore lewat fungsi bernama, bukan inline di komponen
export async function simpanSetoran(warga: UserDoc, item: SetoranItem): Promise<void> {
  const batch = writeBatch(db);
  const setoranRef = doc(collection(db, "setoran"));
  batch.set(setoranRef, { /* ... */ });
  batch.update(doc(db, "users", warga.uid), {
    saldoPoin: increment(item.poin),
    lastTxnId: setoranRef.id, // wajib — rules validasi delta lewat ini
  });
  await batch.commit();
}
```

- Nama domain bahasa Indonesia mengikuti skema Firestore (`saldoPoin`, `poinDitukar`); istilah teknis Inggris.
- Semua string UI bahasa Indonesia. Error Firebase dipetakan ke pesan Indonesia di satu modul.
- Konstanta tarif hanya di `src/lib/constants.ts`.

## Testing Strategy

Manual (sesuai prompt; rules sudah punya test suite di repo Android). Satu pengecualian kecil: unit check untuk fungsi hitung poin (pembulatan berat→poin) karena rules menuntut integer persis — satu file `src/lib/poin.test.ts` dijalankan `npx vitest run` (vitest sudah terbawa ekosistem Vite; kalau tidak mau dependency, jadikan assert script node biasa).

## Boundaries

- **Selalu:** ikuti format batch/transaction persis seperti rules; semua query pakai `limit()`; `onSnapshot` bukan polling; UI bahasa Indonesia.
- **Tanya dulu:** dependency baru di luar daftar tech stack; perubahan apa pun pada skema/rules/index; query yang butuh index baru.
- **Jangan pernah:** deploy `firestore.rules`/index dari repo ini; Cloud Functions/server/SSR; menulis `saldoPoin` di luar dua jalur atomik; baca koleksi tanpa limit.

## Success Criteria

1. Warga baru bisa registrasi dari web → dokumen `users/{uid}` lolos rules (role `warga`, saldo 0, `namaLower` benar) → email verifikasi terkirim.
2. Saldo warga di web berubah realtime saat ops (web atau Android) input setoran.
3. Alur QR lengkap: ops buat permintaan → QR full-screen + countdown 3 menit → warga scan → `runTransaction` pending→confirmed lolos rules → layar ops berubah "Terkonfirmasi" otomatis; alur expire → buat ulang/batalkan jalan.
4. Setoran dengan berat desimal menghasilkan poin integer yang identik dengan aplikasi Android (lihat Open Questions #1).
5. Lighthouse PWA installable; prompt install muncul di Chrome Android; instruksi manual tampil di iOS Safari.
6. Tidak ada operasi tulis yang ditolak `permission-denied` pada alur normal.
7. `npm run build` bersih; deploy ke Firebase Hosting sukses; app jalan standalone dari home screen.

## Keputusan dari Sumber Android (Repo.kt — verified 2026-07-16)

1. **Pembulatan poin:** `poinDari(berat) = (berat × 5).roundToLong()` → web: `Math.round(beratKg * TARIF_POIN_PER_KG)`. Contoh: 1,5 kg = 8 poin; 1,4 kg = 7 poin. Wajib identik dengan Android.
2. **Leaderboard WAJIB ditulis di batch setoran** (prompt web tidak menyebut, tapi Android melakukannya — tanpa ini data lintas platform bolong): doc `leaderboard/{season}__{wargaUid}` di-`set(..., {merge: true})` dengan `{season, uid, nama, poin: increment(totalPoin)}`. Season = kuartal kalender `"YYYY-Q1..Q4"` (bulan 0-based ÷ 3 + 1). Halaman tampilan leaderboard TIDAK dibuat di web (di luar scope prompt) — hanya penulisannya demi konsistensi.
3. **Koleksi `jenisSampah` diabaikan** — Android juga hardcode 4 chip (`Plastik, Logam, Kardus, Lainnya`) dan tidak membaca koleksi itu.
4. Angka poin/saldo bertipe integer (`Long` di Android); `beratKg` boleh desimal (double).

## Open Questions (blocker sebelum Phase 2)

1. **`firebaseConfig`.** Perlu Web App terdaftar di project `bank-sampah-kkn`. Mau saya buatkan lewat Firebase MCP tools (perlu login), atau kamu daftarkan manual di Console lalu paste confignya? (Scaffold bisa jalan duluan; config bisa menyusul di `src/lib/firebase.ts`.)

## Asumsi (koreksi kalau salah)

1. React Router DOM boleh sebagai dependency routing (standar, ringan).
2. Node.js 20+ dan npm tersedia di mesin dev.
3. Scaffold langsung di root `/home/kevin/clcode/websampah` (folder `agent-skills/` dipindah/di-gitignore — itu clone referensi, bukan bagian proyek).
4. Nama app di manifest: "Bank Sampah KKN"; bahasa `id`.
5. Field `wargaNama`/`opsId` dst. yang tidak divalidasi rules tetap diisi mengikuti skema di prompt agar konsisten dengan Android.
