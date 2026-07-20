# Graph Report - websampah  (2026-07-18)

## Corpus Check
- 64 files · ~20,150 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 533 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fda82ca2`
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
- QrFullscreen.tsx
- layout.tsx
- CLAUDE.md
- AGENTS.md
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `getSessionUser()` - 18 edges
2. `compilerOptions` - 16 edges
3. `Global Constraints` - 15 edges
4. `fmtRupiah()` - 13 edges
5. `requireRole()` - 12 edges
6. `buatUser()` - 10 edges
7. `Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js` - 10 edges
8. `hashPassword()` - 8 edges
9. `setoranPage()` - 8 edges
10. `resetDb()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `siap()` --calls--> `buatUser()`  [EXTRACTED]
  webapp/tests/db/penukaran.test.ts → webapp/tests/db/helpers.ts
- `QrFullscreen()` --references--> `qrcode`  [EXTRACTED]
  webapp/src/components/QrFullscreen.tsx → webapp/package.json
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  webapp/prisma/seed.ts → webapp/src/lib/password.ts
- `RegisterPage()` --calls--> `registerAction()`  [EXTRACTED]
  webapp/src/app/(auth)/register/page.tsx → webapp/src/lib/actions/auth.ts
- `ResetForm()` --calls--> `resetPasswordAction()`  [EXTRACTED]
  webapp/src/app/(auth)/reset/ResetForm.tsx → webapp/src/lib/actions/auth.ts

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.08
Nodes (33): main(), prisma, LoginPage(), LoginState, ResetState, RegisterPage(), RegisterState, ResetForm() (+25 more)

### Community 1 - "page.tsx"
Cohesion: 0.09
Nodes (34): GET(), OpsPage(), STATUS_LABEL, OpsPenukaranPage(), OpsSetoranPage(), STATUS_LABEL, WargaPage(), ScanPage() (+26 more)

### Community 2 - "ops.ts"
Cohesion: 0.17
Nodes (21): PenukaranForm(), SetoranForm(), WargaSearch(), batalkanPenukaranAction(), buatPenukaranAction(), BuatPenukaranState, cariWargaAction(), RiwayatPage (+13 more)

### Community 3 - "dependencies"
Cohesion: 0.07
Nodes (28): jsqr, next, @node-rs/argon2, @prisma/client, qrcode, react, react-dom, resend (+20 more)

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
Cohesion: 0.31
Nodes (12): Home(), InstallButtonKecil(), InstallPrompt(), BeforeInstallPromptEvent, getPilihan(), isIos(), isStandalone(), promptInstall() (+4 more)

### Community 8 - "Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js"
Cohesion: 0.18
Nodes (10): Arsitektur, Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js, Di luar scope, Invarian bisnis (pindahan dari firestore.rules → kode server), Keputusan (dari sesi brainstorming 2026-07-17), Kriteria sukses, Migrasi data (big-bang), Pemetaan query Firestore → SQL/Prisma (+2 more)

### Community 9 - "Bank Sampah — Web PWA (Next.js + Prisma + Neon)"
Cohesion: 0.20
Nodes (9): Bank Sampah — Web PWA (Next.js + Prisma + Neon), Catatan keamanan, Deploy Vercel, Dev lokal, Prasyarat, RUNBOOK GO-LIVE, Setup, Stack (+1 more)

### Community 10 - "QrFullscreen.tsx"
Cohesion: 0.43
Nodes (5): Props, QrFullscreen(), PenukaranDTO, fmtTanggal(), sisaDetik()

## Knowledge Gaps
- **103 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `QrFullscreen()` connect `QrFullscreen.tsx` to `page.tsx`, `dependencies`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `qrcode` connect `dependencies` to `QrFullscreen.tsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08385744234800839 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08973172987974098 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._