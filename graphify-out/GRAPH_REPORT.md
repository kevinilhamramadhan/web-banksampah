# Graph Report - websampah  (2026-07-21)

## Corpus Check
- 110 files · ~31,026 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 460 nodes · 711 edges · 53 communities (43 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d696c954`
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
- page.tsx
- TombolTema.tsx
- page.tsx
- UnduhLaporan.tsx

## God Nodes (most connected - your core abstractions)
1. `getSessionUser()` - 26 edges
2. `compilerOptions` - 16 edges
3. `Global Constraints` - 15 edges
4. `hashPassword()` - 13 edges
5. `buatUser()` - 12 edges
6. `resetDb()` - 11 edges
7. `Product` - 10 edges
8. `Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js` - 10 edges
9. `fmtRupiah()` - 9 edges
10. `sendVerification()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `siap()` --calls--> `buatUser()`  [EXTRACTED]
  webapp/tests/db/penukaran.test.ts → webapp/tests/db/helpers.ts
- `OpsAnalitikPage()` --calls--> `analitikOps`  [EXTRACTED]
  webapp/src/app/ops/analitik/page.tsx → webapp/src/lib/analitik.ts
- `KontribusiPage()` --calls--> `kontribusiWarga`  [EXTRACTED]
  webapp/src/app/warga/kontribusi/page.tsx → webapp/src/lib/kontribusi.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  webapp/prisma/seed-warga.ts → webapp/src/lib/password.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  webapp/prisma/seed.ts → webapp/src/lib/password.ts

## Import Cycles
- None detected.

## Communities (53 total, 10 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.09
Nodes (34): main(), prisma, main(), prisma, LoginPage(), LoginState, ResetState, RegisterPage() (+26 more)

### Community 1 - "page.tsx"
Cohesion: 0.08
Nodes (46): qrcode, qrcode, GET(), PenukaranForm(), Props, QrFullscreen(), bacaQr(), BarcodeDetectorLike (+38 more)

### Community 2 - "ops.ts"
Cohesion: 0.13
Nodes (16): ResetForm(), ResetState, VerifikasiForm(), VerifikasiState, VerifikasiBanner(), gantiEmailAction(), resendVerificationAction(), resetPasswordAction() (+8 more)

### Community 3 - "dependencies"
Cohesion: 0.07
Nodes (27): jsqr, next, @node-rs/argon2, @prisma/client, react, react-dom, resend, dependencies (+19 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.11
Nodes (19): dotenv, prisma, tsx, @types/node, @types/qrcode, @types/react, @types/react-dom, typescript (+11 more)

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
Cohesion: 0.29
Nodes (3): IKON, Item, MENU

### Community 19 - "ResetForm.tsx"
Cohesion: 0.29
Nodes (6): Anti-Patterns Verdict, Design Health Score (Nielsen) — 29/40 "Good" (naik dari 21), Minor, Persona, Pertanyaan provokatif, Priority Issues

### Community 22 - "page.tsx"
Cohesion: 0.33
Nodes (5): Anti-Patterns Verdict, Design Health Score (Nielsen) — 21/40 "Acceptable", Minor, Persona Red Flags, Priority Issues

### Community 29 - "jenis.ts"
Cohesion: 0.30
Nodes (13): isUniqueError(), JenisDTO, muatJenisAction(), pastikanOps(), segarkan(), tambahJenisAction(), toggleJenisAction(), ubahTarifAction() (+5 more)

### Community 31 - "page.tsx"
Cohesion: 0.26
Nodes (9): OpsAnalitikPage(), OpsPage(), analitikOps, JenisRingkas, kunciBulan(), labelBulan(), RingkasanBulan, ringkasanBulanIni() (+1 more)

### Community 32 - "RiwayatList.tsx"
Cohesion: 0.20
Nodes (9): BarisPenukaran(), BarisSetoran(), PenukaranRow, Props, RiwayatPage, SetoranRow, STATUS_LABEL, fmtTanggal() (+1 more)

### Community 33 - "kontribusi.ts"
Cohesion: 0.36
Nodes (6): KontribusiPage(), JenisRingkas, kontribusiWarga, kunciBulan(), labelBulan(), TrenBulan

### Community 34 - "route.ts"
Cohesion: 0.24
Nodes (11): RFC-4180, GET(), parseTanggal(), slug(), STATUS, tgl(), bidangCsv(), BOM (+3 more)

## Knowledge Gaps
- **156 isolated node(s):** `IKON`, `TAUTAN`, `IKON`, `Item`, `MENU` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `page.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `QrFullscreen()` connect `page.tsx` to `RiwayatList.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `qrcode` connect `page.tsx` to `dependencies`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `IKON`, `TAUTAN`, `IKON` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08583959899749373 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07985480943738657 - nodes in this community are weakly interconnected._
- **Should `ops.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12666666666666668 - nodes in this community are weakly interconnected._