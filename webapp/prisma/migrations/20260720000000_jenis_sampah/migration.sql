-- CreateTable
CREATE TABLE "JenisSampah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tarifPoinPerKg" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JenisSampah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JenisSampah_nama_key" ON "JenisSampah"("nama");

-- Seed jenis sampah awal (tarif 5 poin/kg, konsisten dengan hardcode lama).
-- UUID dipatok agar deterministik lintas lingkungan.
INSERT INTO "JenisSampah" ("id", "nama", "tarifPoinPerKg", "aktif", "urutan") VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Plastik', 5, true, 0),
  ('a0000000-0000-4000-8000-000000000002', 'Logam',   5, true, 1),
  ('a0000000-0000-4000-8000-000000000003', 'Kardus',  5, true, 2),
  ('a0000000-0000-4000-8000-000000000004', 'Lainnya', 5, true, 3);
