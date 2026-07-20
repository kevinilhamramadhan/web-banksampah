---
target: warga dashboard
total_score: 21
p0_count: 0
p1_count: 2
timestamp: 2026-07-18T15-39-58Z
slug: webapp-src-app-warga-page-tsx
---
Method: dual-agent (A: design review · B: detector) — catatan: inspeksi browser A gagal (binary Chrome tidak tersedia di sandbox), sehingga A menilai dari pembacaan penuh source + kalkulasi kontras/layout, bukan screenshot.

## Design Health Score (Nielsen) — 21/40 "Acceptable"

| # | Heuristik | Skor | Isu kunci |
|---|---|---|---|
| 1 | Visibility of status | 2 | Tidak ada aria-live — status async (memuat, cooldown, error) bisu utk screen reader |
| 2 | Match real world | 3 | Bahasa Indonesia polos, istilah poin/kg/RT-RW — bagus |
| 3 | User control | 2 | Warga tak bisa membatalkan penukaran pending sendiri; tanpa undo |
| 4 | Consistency | 2 | CTA "disabled" tidak konsisten visual vs fungsional (lihat P1) |
| 5 | Error prevention | 1 | Tombol scan disabled DIBUNGKUS Link — keyboard user tetap bisa masuk (P1) |
| 6 | Recognition > recall | 3 | Aturan tarif tercetak di kartu saldo — jembatan memori yang bagus |
| 7 | Flexibility | 2 | Tanpa akselerator (wajar utk audiens) |
| 8 | Aesthetic/minimalist | 2 | 6 blok tak berhirarki menumpuk di satu layar |
| 9 | Error recovery | 3 | Copy error manusiawi & actionable |
| 10 | Help | 1 | Tak ada bantuan kontekstual selain satu baris tarif |

## Anti-Patterns Verdict
- Deterministik (Assessment B): 0 temuan di seluruh webapp/src — tanpa side-stripe, gradient text, eyebrow, card-grid.
- LLM (Assessment A): sebagian besar BUKAN slop — tapi dua tell: (1) kartu saldo secara harfiah dikomentari "gaya kartu bank" (globals.css:129) padahal anti-referensi produk = "bukan app bank formal"; (2) momen "Penukaran berhasil" (ScanQr) datar total — tanpa emas, tanpa gerak — untuk brand "ceria, memotivasi".

## Priority Issues
- [P1] CTA scan disabled dibungkus <Link> (warga/page.tsx:47-51) — keyboard/AT bypass gate verifikasi; pindahkan gating ke Link/render span non-interaktif.
- [P1] Layar pertama warga belum-verifikasi menyodorkan 7 kontrol sekaligus — melanggar prinsip "satu layar satu tugas"; runtuhkan jadi saldo + banner verifikasi saja.
- [P2] Momen sukses penukaran tanpa perayaan — pakai --emas, animasi singkat, copy hangat.
- [P2] Metafora "kartu bank" di kartu saldo bertentangan dgn PRODUCT.md — pertahankan hero number, lepaskan panel gradien gelap gaya kartu debit.
- [P3] Banner verifikasi hanya dibedakan border emas 1px (warna-saja) — tambah ikon + tint latar.

## Persona Red Flags
- Jordan (pemula): tombol scan abu-abu tanpa penjelasan inline kenapa; alasan ada di kartu terpisah.
- Casey (mobile, koneksi lambat): tab Penukaran pertama kali = "Memuat…" polos beberapa detik, terkesan hang.
- Sam (AT): link-scan bypass; hirarki heading loncat h1→h3; nol aria-live.

## Minor
- role="tablist" tanpa aria-controls/tabpanel/roving tabindex; .rupiah emas ≈4.04:1 (lolos large-text, di bawah AA normal); desktop = kolom 720px polos (disengaja?).
