# Prompt: Penyempurnaan UI/UX PWA "Bank Sampah Digital"

Salin seluruh isi di bawah ini dan berikan ke AI coding agent (Claude Code, dsb) di dalam repo `web-banksampah`.

---

## KONTEKS PROJECT

Ini adalah web PWA "Bank Sampah Digital" untuk program KKN, dibangun dengan:

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Prisma 6** + Neon Postgres
- **Resend** untuk email verifikasi/reset password
- **CSS murni** dengan CSS custom properties (OKLCH) — **bukan Tailwind**, jangan
  perkenalkan Tailwind atau library CSS-in-JS baru
- Auth sesi cookie server-side, password di-hash Argon2

**Role**: `warga` (nasabah) dan `ops` (petugas bank sampah).

### Design system yang sudah ada (WAJIB dipertahankan & dikembangkan, jangan diganti)

Sistem warna "Daun & Emas": hijau (`--hijau`, `--hijau-pekat`) untuk identitas &
aksi utama, emas (`--emas`, `--emas-teks`) **eksklusif untuk angka uang/poin**.
Semua token ada di `src/app/globals.css` sebagai CSS variable OKLCH, sudah
divalidasi kontras WCAG AA, dan sudah punya varian dark mode via
`prefers-color-scheme`. Ada juga: app-shell dengan bottom nav (`.nav-bawah`),
kelas komponen (`.card`, `.btn`, `.chip`, `.input`, `.kartu-perhatian`), animasi
gerak halus (`--gerak-cepat`, `--gerak-sedang`), dan skeleton loading.

Pertahankan gaya penamaan variabel/kelas dalam Bahasa Indonesia yang konsisten
dengan codebase (`warga`, `saldo`, `setoran`, `penukaran`, `riwayat`, dst).

### Halaman & komponen yang sudah ada

- **Auth** `(auth)`: login, register, verifikasi email, reset password
- **Warga**: dashboard (saldo, riwayat), scan QR penukaran, peringkat/leaderboard
- **Ops**: input setoran, proses penukaran via QR, cari warga
- **Komponen**: AppHeader, AppNav, InstallPrompt/InstallButtonKecil (PWA
  install), PenukaranForm, QrFullscreen, RiwayatList, ScanQr, SetoranForm,
  VerifikasiBanner, WargaSearch

### Yang **belum ada** dan jadi gap terbesar saat ini

- **Tidak ada service worker** — manifest.webmanifest sudah ada (icons,
  theme_color, standalone display), tapi tidak ada offline caching/fallback
  sama sekali. Ini bikin app belum benar-benar "PWA" secara fungsional,
  cuma installable secara nama.
- Tidak ada dark mode toggle manual (cuma ikut setting sistem)
- Tidak ada halaman profil/pengaturan warga
- Tidak ada splash screen iOS / app shortcuts di manifest

---

## TUGAS

Audit dan sempurnakan UI/UX project ini menjadi PWA yang **lengkap dan
standar** secara production-grade, dengan tetap konsisten pada design system
yang sudah ada. Cakupannya:

### 1. Kelengkapan PWA teknis
- Tambahkan service worker (boleh pakai Workbox atau native, sesuaikan dengan
  Next.js 16 App Router) untuk cache app shell + strategi offline yang masuk
  akal untuk tiap tipe halaman (statis vs data dinamis)
- Buat halaman/fallback offline yang informatif, bukan error browser default
- Lengkapi manifest: `shortcuts` (mis. shortcut ke "Scan QR" dan "Setor
  Sampah"), `apple-touch-icon` + splash screen iOS
  (`apple-mobile-web-app-capable`, meta viewport yang benar)
- Audit installability & Lighthouse PWA checklist, laporkan skor sebelum/sesudah

### 2. Konsistensi & kelengkapan UI
- Audit semua halaman yang ada terhadap design system — pastikan tidak ada
  halaman yang "lupa" pakai token warna/komponen yang sudah didefinisikan
- Lengkapi state yang sering terlewat di tiap halaman: **loading**, **empty
  state** (mis. riwayat kosong, hasil pencarian warga kosong), **error state**,
  dan **state offline**
- Audit aksesibilitas: kontras warna, ukuran target sentuh (≥44px sudah ada di
  `.btn`/`.chip`, pastikan konsisten di semua elemen interaktif baru), label
  ARIA untuk ikon-only button, fokus keyboard yang terlihat jelas
- Tambahkan dark mode toggle manual (simpan preferensi di localStorage/cookie),
  tetap fallback ke `prefers-color-scheme` kalau user belum pernah memilih

### 3. Implementasikan fitur tambahan berikut (pilih/prioritaskan sesuai arahan saya di bawah)

> Catatan untuk AI: jangan implementasikan semua sekaligus tanpa konfirmasi.
> Untuk tiap fitur, buat dulu rencana singkat (halaman/komponen/perubahan
> schema Prisma yang dibutuhkan) sebelum mulai coding.

- [ ] Halaman profil/pengaturan warga (edit data, ganti password)
- [ ] Notifikasi in-app (riwayat transaksi sebagai lonceng notifikasi)
- [ ] Unduh/cetak bukti setoran & penukaran sebagai PDF
- [ ] Grafik kontribusi warga (tren sampah per bulan, jenis favorit)
- [ ] Onboarding singkat untuk warga yang baru pertama login
- [ ] Dashboard analitik ops (total terkumpul, tren mingguan/bulanan)
- [ ] Manajemen jenis sampah & tarif dari database (ganti hardcode di
      `src/lib/constants.ts`)
- [ ] Export laporan CSV/Excel per periode untuk LPJ ke desa
- [ ] Filter & pencarian riwayat transaksi (tanggal/warga/jenis sampah)
- [ ] Halaman kebijakan privasi, syarat ketentuan, dan "Tentang"

*(Saya akan centang/sebutkan mana yang mau dikerjakan duluan — kalau belum
saya tandai, tanyakan ke saya prioritasnya sebelum mulai, jangan asumsikan
semua harus dikerjakan.)*

### 4. Batasan teknis
- Jangan ubah stack (tetap Next.js App Router + Prisma + Neon, CSS murni)
- Jangan pecah kontrak `src/lib/constants.ts` (`poinDari`, `parseBerat`,
  `fmtRupiah`) tanpa update semua pemanggilnya
- `@node-rs/argon2` butuh Node.js runtime, bukan Edge — jangan tambahkan
  `export const runtime = "edge"` di route yang menyentuh `src/lib/password.ts`
- Kalau perlu migrasi schema Prisma, buat migration baru, jangan edit migration
  lama
- Tulis/lengkapi test (`vitest`) untuk logic baru sesuai pola yang sudah ada
  di `*.test.ts`

### 5. Output yang diharapkan
Sebelum coding, berikan ringkasan singkat: halaman/komponen apa saja yang akan
disentuh, perubahan schema (jika ada), dan urutan pengerjaan. Baru setelah itu
lanjut implementasi bertahap per fitur, bukan satu commit besar untuk semuanya.
