import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database Bank Sampah...");

  // 1. Akun Ops
  const emailOps = process.env.SEED_OPS_EMAIL || "ops@banksampah.id";
  const passwordOps = process.env.SEED_OPS_PASSWORD || "ops123456";
  const namaOps = process.env.SEED_OPS_NAMA ?? "Ops Bank Sampah";

  const passwordHashOps = await hashPassword(passwordOps);

  const ops = await prisma.user.upsert({
    where: { email: emailOps },
    update: {
      role: "ops",
      passwordHash: passwordHashOps,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: emailOps,
      nama: namaOps,
      noHp: "081122334455",
      alamat: "Kantor Bank Sampah",
      role: "ops",
      passwordHash: passwordHashOps,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Akun ops siap: ${ops.email}`);

  // 2. Jenis sampah awal & tarif
  const jenisData = [
    { nama: "Plastik", tarifPoinPerKg: 5, urutan: 0 },
    { nama: "Logam", tarifPoinPerKg: 10, urutan: 1 },
    { nama: "Kardus", tarifPoinPerKg: 4, urutan: 2 },
    { nama: "Kaca", tarifPoinPerKg: 6, urutan: 3 },
    { nama: "Lainnya", tarifPoinPerKg: 5, urutan: 4 },
  ];

  const jenisMap = new Map<string, { id: string; nama: string; tarifPoinPerKg: number }>();
  for (const j of jenisData) {
    const res = await prisma.jenisSampah.upsert({
      where: { nama: j.nama },
      update: { tarifPoinPerKg: j.tarifPoinPerKg, urutan: j.urutan },
      create: j,
    });
    jenisMap.set(j.nama, res);
  }
  console.log(`✅ Jenis sampah siap: ${Array.from(jenisMap.keys()).join(", ")}`);

  // 3. Akun Warga Sampel (untuk testing Peringkat, Riwayat & Transaksi)
  const defaultWargaPassword = await hashPassword("warga123456");
  const wargaList = [
    {
      email: "budi@warga.id",
      nama: "Budi Santoso",
      noHp: "081234567890",
      alamat: "RT 01 / RW 02",
    },
    {
      email: "siti@warga.id",
      nama: "Siti Rahma",
      noHp: "081298765432",
      alamat: "RT 03 / RW 02",
    },
    {
      email: "ahmad@warga.id",
      nama: "Ahmad Hidayat",
      noHp: "085612345678",
      alamat: "RT 02 / RW 01",
    },
  ];

  const createdWarga: Array<{ id: string; email: string; nama: string }> = [];

  for (const w of wargaList) {
    const u = await prisma.user.upsert({
      where: { email: w.email },
      update: {
        nama: w.nama,
        noHp: w.noHp,
        alamat: w.alamat,
        emailVerifiedAt: new Date(),
      },
      create: {
        email: w.email,
        nama: w.nama,
        noHp: w.noHp,
        alamat: w.alamat,
        role: "warga",
        passwordHash: defaultWargaPassword,
        emailVerifiedAt: new Date(),
      },
    });
    createdWarga.push(u);
  }

  // 4. Sampel Transaksi Setoran & Penukaran (jika belum ada setoran)
  const setoranCount = await prisma.setoran.count();
  if (setoranCount === 0) {
    console.log("📦 Membuat sampel transaksi untuk testing fitur...");
    const [budi, siti, ahmad] = createdWarga;
    const plastik = jenisMap.get("Plastik")!;
    const logam = jenisMap.get("Logam")!;
    const kardus = jenisMap.get("Kardus")!;
    const kaca = jenisMap.get("Kaca")!;

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Transaksi Budi: Total 180 poin - 50 penukaran = 130 poin
    await prisma.setoran.create({
      data: {
        wargaId: budi.id,
        opsId: ops.id,
        totalPoin: 100,
        tanggal: new Date(now - 10 * DAY),
        items: {
          create: [
            { jenisSampahId: plastik.id, jenisSampahNama: plastik.nama, beratKg: 10, poin: 50 },
            { jenisSampahId: logam.id, jenisSampahNama: logam.nama, beratKg: 5, poin: 50 },
          ],
        },
      },
    });

    await prisma.setoran.create({
      data: {
        wargaId: budi.id,
        opsId: ops.id,
        totalPoin: 80,
        tanggal: new Date(now - 4 * DAY),
        items: {
          create: [
            { jenisSampahId: kardus.id, jenisSampahNama: kardus.nama, beratKg: 15, poin: 60 },
            { jenisSampahId: plastik.id, jenisSampahNama: plastik.nama, beratKg: 4, poin: 20 },
          ],
        },
      },
    });

    await prisma.penukaran.create({
      data: {
        wargaId: budi.id,
        opsId: ops.id,
        poinDitukar: 50,
        jumlahRupiah: 10000,
        status: "confirmed",
        confirmedAt: new Date(now - 2 * DAY),
        createdAt: new Date(now - 2 * DAY),
        tokenExpiredAt: new Date(now - 2 * DAY + 180000),
      },
    });

    await prisma.user.update({ where: { id: budi.id }, data: { saldoPoin: 130 } });

    // Transaksi Siti: Total 310 poin - 100 penukaran = 210 poin
    await prisma.setoran.create({
      data: {
        wargaId: siti.id,
        opsId: ops.id,
        totalPoin: 260,
        tanggal: new Date(now - 8 * DAY),
        items: {
          create: [
            { jenisSampahId: logam.id, jenisSampahNama: logam.nama, beratKg: 20, poin: 200 },
            { jenisSampahId: kaca.id, jenisSampahNama: kaca.nama, beratKg: 10, poin: 60 },
          ],
        },
      },
    });

    await prisma.setoran.create({
      data: {
        wargaId: siti.id,
        opsId: ops.id,
        totalPoin: 50,
        tanggal: new Date(now - 1 * DAY),
        items: {
          create: [
            { jenisSampahId: plastik.id, jenisSampahNama: plastik.nama, beratKg: 10, poin: 50 },
          ],
        },
      },
    });

    await prisma.penukaran.create({
      data: {
        wargaId: siti.id,
        opsId: ops.id,
        poinDitukar: 100,
        jumlahRupiah: 20000,
        status: "confirmed",
        confirmedAt: new Date(now - 3 * DAY),
        createdAt: new Date(now - 3 * DAY),
        tokenExpiredAt: new Date(now - 3 * DAY + 180000),
      },
    });

    // Active pending QR for testing QR Scan
    await prisma.penukaran.create({
      data: {
        wargaId: siti.id,
        opsId: ops.id,
        poinDitukar: 50,
        jumlahRupiah: 10000,
        status: "pending",
        createdAt: new Date(),
        tokenExpiredAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await prisma.user.update({ where: { id: siti.id }, data: { saldoPoin: 210 } });

    // Transaksi Ahmad: Total 100 poin
    await prisma.setoran.create({
      data: {
        wargaId: ahmad.id,
        opsId: ops.id,
        totalPoin: 100,
        tanggal: new Date(now - 3 * DAY),
        items: {
          create: [
            { jenisSampahId: plastik.id, jenisSampahNama: plastik.nama, beratKg: 12, poin: 60 },
            { jenisSampahId: kardus.id, jenisSampahNama: kardus.nama, beratKg: 10, poin: 40 },
          ],
        },
      },
    });

    await prisma.user.update({ where: { id: ahmad.id }, data: { saldoPoin: 100 } });

    console.log("🎉 Sampel transaksi setoran & penukaran berhasil dibuat!");
  }

  console.log("\n📋 AKUN SAMPLE UNTUK UJI COBA (LOGIN):");
  console.log(`- Petugas Ops : ${emailOps} | Password: ${passwordOps}`);
  console.log(`- Warga 1 (Siti)  : siti@warga.id | Password: warga123456 (Peringkat #1 - 310 Poin)`);
  console.log(`- Warga 2 (Budi)  : budi@warga.id | Password: warga123456 (Peringkat #2 - 180 Poin)`);
  console.log(`- Warga 3 (Ahmad) : ahmad@warga.id | Password: warga123456 (Peringkat #3 - 100 Poin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
