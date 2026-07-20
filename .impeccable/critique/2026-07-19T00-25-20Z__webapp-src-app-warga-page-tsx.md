---
target: warga dashboard (pasca-redesign)
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-07-19T00-25-20Z
slug: webapp-src-app-warga-page-tsx
---
Method: dual-agent (A: design review · B: detector). Catatan: dev server mati saat A berjalan — bukti dari pembacaan source penuh, bukan DOM ter-render.

## Design Health Score (Nielsen) — 29/40 "Good" (naik dari 21)

| # | Heuristik | Skor | Isu kunci |
|---|---|---|---|
| 1 | Visibility of status | 3 | Status scan/riwayat bagus; belum ada sinyal offline utk pengguna luar ruangan |
| 2 | Match real world | 4 | Bahasa Indonesia polos, aturan tarif inline |
| 3 | User control | 3 | Belum-verifikasi tak punya jalan keluar utk email salah ketik |
| 4 | Consistency | 2 | Header diduplikasi: AppHeader vs markup inline warga/page |
| 5 | Error prevention | 3 | Race QR dijaga; login hanya validasi HTML5 |
| 6 | Recognition | 4 | Baris riwayat mandiri |
| 7 | Flexibility | 2 | Satu jalur utk semua (wajar utk persona) |
| 8 | Aesthetic/minimalist | 4 | Dashboard = header + 1 CTA + tab — "satu layar satu tugas" tercapai |
| 9 | Error recovery | 3 | Pesan spesifik; fase "proses" tanpa timeout/cancel |
| 10 | Help | 1 | Tak ada tautan bantuan/kontak posko di seluruh alur warga |

## Anti-Patterns Verdict
- Deterministik: 0 temuan (bersih, dua kali berturut).
- LLM: "Reads as intentional, not template" — sistem bernama dgn jejak keputusan kontras terdokumentasi; hero number TANPA klise kartu bank; tablist ARIA lengkap dinilai "rare to see this fully correct".

## Priority Issues
- [P1] Kondisi belum-verifikasi = jalan buntu: tak ada koreksi email salah ketik / petunjuk cek spam / kontak ops (VerifikasiBanner).
- [P2] "Keluar" menempati slot paling terlihat di baris pertama — rawan tap tak sengaja (Casey), tanpa konfirmasi.
- [P2] Markup header duplikat (warga/page inline vs AppHeader) — satu peran visual, dua implementasi.
- [P3] fase "proses" scan tanpa timeout/cancel — di koneksi jelek bisa menggantung tanpa jalan keluar.
- [P3/a11y] Layar perayaan tidak mengelola fokus — momen terpenting app tidak dipindahkan fokusnya utk pengguna keyboard/screen reader.

## Persona
- Jordan: lihat mekanik reward sejak awal (bagus); buntu kalau salah email.
- Casey: tab default ter-SSR tanpa flicker (bagus); celah "proses" tanpa cancel.
- Sam: tablist/aria-live/heading/focus-visible solid; fokus tidak dikelola saat layar perayaan muncul.

## Minor
- +hijau/-merah di ledger = konvensi bank (tegang tipis dgn anti-referensi); InstallButtonKecil antiklimaks di dasar; aturan tarif tampil permanen tiap kunjungan; dark mode OS-only (pilihan sadar).

## Pertanyaan provokatif
1. Kalau "angka uang adalah pahlawan", kenapa poin yang besar dan rupiah kecil — padahal rupiah-lah yang bermakna bagi warga?
2. Penukaran wajib tatap muka dgn ops — apakah gerbang verifikasi email masih melindungi sesuatu yang nyata, atau hanya menyandera warga yang emailnya nyasar?
