// webapp/scripts/migrate-firestore.ts
// Big-bang: baca Auth (hash scrypt) + Firestore → Neon. Jalankan saat sistem dibekukan.
// --emulator: pakai FIRESTORE_EMULATOR_HOST/FIREBASE_AUTH_EMULATOR_HOST utk gladi bersih.
//
// Idempoten: setiap baris di-upsert by id lama (dokumen Firestore) dengan `update: {}`,
// jadi run kedua tidak menduplikasi apa pun (lihat migrate-firestore.test-run.md).
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { prisma } from "../src/lib/db";

const emu = process.argv.includes("--emulator");
if (emu) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
}
initializeApp(
  emu
    ? { projectId: "bank-sampah-kkn" }
    : { credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!) },
);
const db = getFirestore();

async function main() {
  // Anomali (referensi rusak dsb) dicatat di sini, bukan menghentikan migrasi —
  // data produksi lama bisa punya sisa uji/koreksi manual yang perlu ditinjau manusia.
  const errors: string[] = [];

  // 1. Auth: uid → {hash, salt}. Emulator kadang tidak mengembalikan passwordHash sama
  // sekali (auth emulator tidak menghitung scrypt sungguhan) — tangani null dengan aman.
  const hashes = new Map<string, { hash: string | null; salt: string | null }>();
  let page = await getAuth().listUsers(1000);
  for (;;) {
    for (const u of page.users) {
      hashes.set(u.uid, {
        hash: u.passwordHash ?? null,
        salt: u.passwordSalt ?? null,
      });
    }
    if (!page.pageToken) break;
    page = await getAuth().listUsers(1000, page.pageToken);
  }

  // 2. users — skrip mengiterasi dokumen Firestore, bukan daftar Auth. Akun Auth tanpa
  // dokumen users/ (mis. registrasi yang ditolak rules) otomatis terlewati; ini benar,
  // karena akun semacam itu tidak pernah punya identitas di sistem bank sampah.
  const userDocs = (await db.collection("users").get()).docs;
  const userIds = new Set<string>();
  let usersMigrated = 0;
  for (const d of userDocs) {
    const x = d.data();
    const h = hashes.get(d.id);
    try {
      await prisma.user.upsert({
        where: { id: d.id },
        create: {
          id: d.id, role: x.role, nama: x.nama, noHp: x.noHp ?? "", alamat: x.alamat ?? "",
          email: x.email, saldoPoin: x.saldoPoin,
          firebaseHash: h?.hash ?? null, firebaseSalt: h?.salt ?? null,
          emailVerifiedAt: new Date(), // semua user lama dianggap sudah verified (gate lama menjaminnya utk penukar)
          createdAt: x.createdAt?.toDate() ?? new Date(),
        },
        update: {},
      });
      userIds.add(d.id);
      usersMigrated++;
    } catch (e) {
      errors.push(`user ${d.id}: ${(e as Error).message}`);
    }
  }

  // 3. setoran + items — FK wargaId/opsId wajib mengarah ke user yang berhasil dimigrasi
  // (Postgres menegakkan ini via foreign key, tidak seperti Firestore). Dicek dulu di sini
  // supaya satu dokumen rusak dilewati dengan jelas, bukan meruntuhkan seluruh migrasi.
  const setoranDocs = (await db.collection("setoran").get()).docs;
  let setoranMigrated = 0;
  let setoranSkipped = 0;
  for (const d of setoranDocs) {
    const x = d.data();
    if (!userIds.has(x.wargaId) || !userIds.has(x.opsId)) {
      errors.push(`setoran ${d.id}: wargaId/opsId tidak ditemukan di users (wargaId=${x.wargaId}, opsId=${x.opsId}) — dilewati`);
      setoranSkipped++;
      continue;
    }
    try {
      await prisma.setoran.upsert({
        where: { id: d.id },
        create: {
          id: d.id, wargaId: x.wargaId, opsId: x.opsId, totalPoin: x.totalPoin,
          tanggal: x.tanggal?.toDate() ?? new Date(),
          items: { create: (x.items ?? []).map((i: Record<string, unknown>) => ({
            jenisSampahId: i.jenisSampahId, jenisSampahNama: i.jenisSampahNama,
            beratKg: i.beratKg, poin: i.poin,
          })) },
        },
        // update:{} sengaja kosong — pada run kedua baris (dan SetoranItem yang dibuat
        // bersamanya) tidak disentuh lagi, jadi jumlah item tidak pernah dobel.
        update: {},
      });
      setoranMigrated++;
    } catch (e) {
      errors.push(`setoran ${d.id}: ${(e as Error).message}`);
      setoranSkipped++;
    }
  }

  // 4. penukaran
  const penukaranDocs = (await db.collection("penukaran").get()).docs;
  let penukaranMigrated = 0;
  let penukaranSkipped = 0;
  for (const d of penukaranDocs) {
    const x = d.data();
    if (!userIds.has(x.wargaId) || !userIds.has(x.opsId)) {
      errors.push(`penukaran ${d.id}: wargaId/opsId tidak ditemukan di users (wargaId=${x.wargaId}, opsId=${x.opsId}) — dilewati`);
      penukaranSkipped++;
      continue;
    }
    try {
      await prisma.penukaran.upsert({
        where: { id: d.id },
        create: {
          id: d.id, wargaId: x.wargaId, opsId: x.opsId, poinDitukar: x.poinDitukar,
          jumlahRupiah: x.jumlahRupiah, status: x.status, qrToken: x.qrToken,
          tokenExpiredAt: x.tokenExpiredAt?.toDate() ?? new Date(0),
          confirmedAt: x.confirmedAt?.toDate() ?? null, createdAt: x.createdAt?.toDate() ?? new Date(),
        },
        update: {},
      });
      penukaranMigrated++;
    } catch (e) {
      errors.push(`penukaran ${d.id}: ${(e as Error).message}`);
      penukaranSkipped++;
    }
  }

  // 5. Ringkasan: Firestore vs Postgres (informasi saja — data lama bisa punya koreksi
  // manual sehingga totalSaldo tidak wajib persis Σsetoran − Σpenukaran confirmed).
  const [users, setoranAgg, penukaranCount] = await Promise.all([
    prisma.user.aggregate({ _sum: { saldoPoin: true }, _count: true }),
    prisma.setoran.aggregate({ _sum: { totalPoin: true }, _count: true }),
    prisma.penukaran.count(),
  ]);

  console.log(JSON.stringify({
    firestore: { users: userDocs.length, setoran: setoranDocs.length, penukaran: penukaranDocs.length },
    migrated: { users: usersMigrated, setoran: setoranMigrated, penukaran: penukaranMigrated },
    skipped: { setoran: setoranSkipped, penukaran: penukaranSkipped },
    postgres: {
      users: users._count, totalSaldo: users._sum.saldoPoin,
      setoran: setoranAgg._count, totalSetoranPoin: setoranAgg._sum.totalPoin,
      penukaran: penukaranCount,
    },
    errors,
  }, null, 2));

  if (errors.length > 0) {
    console.warn(`\n${errors.length} anomali ditemukan (lihat "errors" di atas). Migrasi TIDAK dihentikan — tinjau manual sebelum go-live.`);
    process.exitCode = 2;
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
