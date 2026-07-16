# Implementation Plan: Bank Sampah Digital — Website PWA

## Overview

Client web PWA (Vite + React + TS) untuk Firebase project `bank-sampah-kkn` yang sudah berjalan dengan aplikasi Android. Backend (Auth, Firestore, rules, index) sudah ada dan read-only. Acuan perilaku: `spec.md`, `prompt-bank-sampah-pwa.md`, dan source Android (`Repo.kt`) untuk format tulis yang lolos rules.

## Architecture Decisions

- **Semua akses Firestore lewat `src/lib/repo.ts`** — port 1:1 dari `Repo.kt` Android (format batch/transaction persis, atau ditolak rules). Komponen tidak memanggil SDK langsung.
- **Konstanta tarif di `src/lib/constants.ts`**; poin = `Math.round(beratKg * 5)` (identik `roundToLong()` Android).
- **Batch setoran menulis 3 dokumen**: setoran + users (increment saldo, lastTxnId) + leaderboard `{season}__{uid}` merge — sama seperti Android.
- **Routing**: react-router-dom, guard berdasarkan `users/{uid}.role` yang dibaca sekali setelah login (bukan claim).
- **PWA**: vite-plugin-pwa `registerType: autoUpdate`, cache app shell saja; data mengandalkan cache bawaan Firestore SDK.
- **Config Firebase** di `src/lib/firebase.ts` — placeholder dulu, diisi saat Web App terdaftar (Open Question spec #1); semua task sebelum Task 3 tidak butuh config asli.

## Dependency Graph

```
T1 scaffold (firebase.ts, constants, theme, router)
 ├─ T2 welcome + PWA install
 └─ T3 auth + route guard  ──┬─ T4 dashboard warga (saldo, riwayat)
                             ├─ T5 ops beranda (riwayat ops)
                             ├─ T6 ops input setoran (search + batch)  ← perlu T4 utk verifikasi saldo realtime
                             └─ T7 ops penukaran QR ── T8 warga scan + confirm  ← perlu T6 (saldo utk ditukar)
T9 responsive/polish  ← semua halaman ada (T2–T8)
T10 deploy + CI + README ← T9
```

## Task List

### Phase 1: Foundation
- [x] Task 1: Scaffold + tema + routing
- [x] Task 2: Welcome screen + PWA install

### Checkpoint 1
- [ ] `npm run build` bersih; dev server render welcome→login; manifest terpasang

### Phase 2: Auth
- [ ] Task 3: Registrasi warga, login, verifikasi email, route guard role

### Checkpoint 2 (butuh firebaseConfig asli mulai sini)
- [ ] Registrasi dari web lolos rules; login ops eksisting masuk UI ops; login warga masuk UI warga

### Phase 3: Fitur inti
- [ ] Task 4: Dashboard warga (saldo realtime + riwayat berhalaman)
- [ ] Task 5: Ops beranda (tab Masuk/Keluar berhalaman)
- [ ] Task 6: Ops input setoran (cari warga + batch atomik + leaderboard)

### Checkpoint 3
- [ ] Setoran via web menambah saldo warga realtime; dokumen setoran+leaderboard identik format Android; unit test poin lulus

### Phase 4: Penukaran QR
- [ ] Task 7: Ops — buat permintaan penukaran + QR fullscreen + countdown + expire/batal/buat-ulang
- [ ] Task 8: Warga — scan kamera + transaction konfirmasi

### Checkpoint 4
- [ ] Alur QR end-to-end dua perangkat: pending→scan→confirmed, saldo berkurang, layar ops berubah otomatis; alur expire jalan

### Phase 5: Polish & Ship
- [ ] Task 9: Responsive pass + polish PWA
- [ ] Task 10: Deploy Firebase Hosting + GitHub Actions + README

### Checkpoint Final
- [ ] Semua Success Criteria di spec.md terpenuhi; app live di Hosting; installable

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Format tulis ditolak rules (`permission-denied`) | High | Port persis dari Repo.kt; uji tulis nyata di Checkpoint 2–4, bukan di akhir |
| `firebaseConfig` belum ada | Med | Placeholder di satu file; T1–T2 jalan tanpa config; blocker baru terasa di Checkpoint 2 |
| Kompatibilitas kamera/BarcodeDetector (iOS Safari) | Med | Fallback jsQR + getUserMedia; uji di HP nyata di Checkpoint 4 |
| Poin beda dengan Android (pembulatan) | High | Satu fungsi `poinDari()` + unit test kasus desimal (1,5→8; 1,4→7) |
| Kuota reads free tier | Low | Semua query `limit()`, onSnapshot hanya utk dokumen tunggal |

## Open Questions
- firebaseConfig: dibuatkan via Firebase tools atau manual Console? (spec.md Open Question #1)
