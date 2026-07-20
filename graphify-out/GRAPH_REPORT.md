# Graph Report - websampah  (2026-07-20)

## Corpus Check
- 112 files · ~31,302 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 448 nodes · 763 edges · 43 communities (36 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1aa2a2fc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.ts
- page.tsx
- ops.ts
- dependencies
- compilerOptions
- devDependencies
- Global Constraints
- install.ts
- Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js
- Bank Sampah — Web PWA (Next.js + Prisma + Neon)
- layout.tsx
- CLAUDE.md
- AGENTS.md
- next.config.ts
- CLAUDE.md
- ResetForm.tsx
- VerifikasiForm.tsx
- page.tsx
- helpers.ts
- jenis.ts
- RiwayatList.tsx
- page.tsx
- RiwayatList.tsx
- kontribusi.ts
- route.ts
- Onboarding.tsx
- email.ts
- page.tsx

## God Nodes (most connected - your core abstractions)
1. `getSessionUser()` - 26 edges
2. `compilerOptions` - 16 edges
3. `Global Constraints` - 15 edges
4. `fmtRupiah()` - 13 edges
5. `hashPassword()` - 13 edges
6. `buatUser()` - 13 edges
7. `requireRole()` - 12 edges
8. `resetDb()` - 12 edges
9. `Product` - 10 edges
10. `Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js` - 10 edges

## Surprising Connections (you probably didn't know these)
- `KontribusiPage()` --calls--> `kontribusiWarga`  [EXTRACTED]
  webapp/src/app/warga/kontribusi/page.tsx → webapp/src/lib/kontribusi.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  webapp/prisma/seed-warga.ts → webapp/src/lib/password.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  webapp/prisma/seed.ts → webapp/src/lib/password.ts
- `RegisterPage()` --calls--> `registerAction()`  [EXTRACTED]
  webapp/src/app/(auth)/register/page.tsx → webapp/src/lib/actions/auth.ts
- `ResetForm()` --calls--> `resetPasswordAction()`  [EXTRACTED]
  webapp/src/app/(auth)/reset/ResetForm.tsx → webapp/src/lib/actions/auth.ts

## Import Cycles
- None detected.

## Communities (43 total, 7 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.18
Nodes (7): ResetForm(), ResetState, VerifikasiForm(), VerifikasiState, resetPasswordAction(), verifyEmailAction(), consumeEmailToken()

### Community 1 - "page.tsx"
Cohesion: 0.10
Nodes (37): GET(), PenukaranForm(), Props, JenisPilihan, SetoranForm(), WargaSearch(), batalkanPenukaranAction(), buatPenukaranAction() (+29 more)

### Community 2 - "ops.ts"
Cohesion: 0.09
Nodes (34): main(), prisma, main(), prisma, LoginPage(), LoginState, ResetState, RegisterPage() (+26 more)

### Community 3 - "dependencies"
Cohesion: 0.11
Nodes (18): jsqr, next, @node-rs/argon2, @prisma/client, qrcode, react, react-dom, resend (+10 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.06
Nodes (31): dotenv, prisma, tsx, @types/node, @types/qrcode, @types/react, @types/react-dom, typescript (+23 more)

### Community 6 - "Global Constraints"
Cohesion: 0.11
Nodes (17): Global Constraints, Migrasi Neon Postgres + Next.js — Implementation Plan, Self-Review (sudah dijalankan penulis plan), Task 10: Halaman warga (dashboard + scan QR), Task 11: Halaman ops (beranda, setoran, penukaran QR + polling), Task 12: Welcome + PWA + seed ops, Task 13: Skrip migrasi data + gladi bersih vs emulator, Task 14: Deploy Vercel + runbook cutover (+9 more)

### Community 7 - "install.ts"
Cohesion: 0.26
Nodes (9): InstallButtonKecil(), InstallPrompt(), BeforeInstallPromptEvent, isIos(), isStandalone(), promptInstall(), shouldShowWelcome(), subs (+1 more)

### Community 8 - "Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js"
Cohesion: 0.18
Nodes (10): Arsitektur, Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js, Di luar scope, Invarian bisnis (pindahan dari firestore.rules → kode server), Keputusan (dari sesi brainstorming 2026-07-17), Kriteria sukses, Migrasi data (big-bang), Pemetaan query Firestore → SQL/Prisma (+2 more)

### Community 9 - "Bank Sampah — Web PWA (Next.js + Prisma + Neon)"
Cohesion: 0.17
Nodes (11): 1. Kelengkapan PWA teknis, 2. Konsistensi & kelengkapan UI, 3. Implementasikan fitur tambahan berikut (pilih/prioritaskan sesuai arahan saya di bawah), 4. Batasan teknis, 5. Output yang diharapkan, Design system yang sudah ada (WAJIB dipertahankan & dikembangkan, jangan diganti), Halaman & komponen yang sudah ada, KONTEKS PROJECT (+3 more)

### Community 11 - "layout.tsx"
Cohesion: 0.27
Nodes (6): metadata, viewport, DaftarSW(), IndikatorOffline(), subscribe(), useOnline()

### Community 13 - "AGENTS.md"
Cohesion: 0.18
Nodes (10): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Platform, Positioning, Product, Product Purpose (+2 more)

### Community 17 - "CLAUDE.md"
Cohesion: 0.22
Nodes (3): IKON, Item, MENU

### Community 19 - "ResetForm.tsx"
Cohesion: 0.29
Nodes (6): Anti-Patterns Verdict, Design Health Score (Nielsen) — 29/40 "Good" (naik dari 21), Minor, Persona, Pertanyaan provokatif, Priority Issues

### Community 22 - "page.tsx"
Cohesion: 0.33
Nodes (5): Anti-Patterns Verdict, Design Health Score (Nielsen) — 21/40 "Acceptable", Minor, Persona Red Flags, Priority Issues

### Community 29 - "jenis.ts"
Cohesion: 0.26
Nodes (15): OpsJenisSampahPage(), KelolaJenis(), isUniqueError(), JenisDTO, muatJenisAction(), pastikanOps(), segarkan(), tambahJenisAction() (+7 more)

### Community 31 - "page.tsx"
Cohesion: 0.11
Nodes (21): OpsAnalitikPage(), OpsLaporanPage(), OpsPage(), ProfilPage(), bacaQr(), BarcodeDetectorLike, ScanQr(), TombolKeluar() (+13 more)

### Community 32 - "RiwayatList.tsx"
Cohesion: 0.20
Nodes (9): BarisPenukaran(), BarisSetoran(), PenukaranRow, Props, RiwayatPage, SetoranRow, STATUS_LABEL, fmtTanggal() (+1 more)

### Community 33 - "kontribusi.ts"
Cohesion: 0.36
Nodes (6): KontribusiPage(), JenisRingkas, kontribusiWarga, kunciBulan(), labelBulan(), TrenBulan

### Community 34 - "route.ts"
Cohesion: 0.24
Nodes (11): RFC-4180, GET(), parseTanggal(), slug(), STATUS, tgl(), bidangCsv(), BOM (+3 more)

### Community 37 - "email.ts"
Cohesion: 0.36
Nodes (9): VerifikasiBanner(), gantiEmailAction(), resendVerificationAction(), createEmailToken(), esc(), kirim(), resend(), sendReset() (+1 more)

## Knowledge Gaps
- **152 isolated node(s):** `IKON`, `Item`, `MENU`, `SLIDE`, `TrenBulan` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `QrFullscreen()` connect `dependencies` to `RiwayatList.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `IKON`, `Item`, `MENU` to the rest of the system?**
  _152 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10195035460992907 - nodes in this community are weakly interconnected._
- **Should `ops.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08834586466165413 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._