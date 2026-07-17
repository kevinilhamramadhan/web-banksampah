-- CreateEnum
CREATE TYPE "Role" AS ENUM ('warga', 'ops');

-- CreateEnum
CREATE TYPE "PenukaranStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('verify', 'reset');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'warga',
    "nama" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "saldo_poin" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT,
    "firebaseHash" TEXT,
    "firebaseSalt" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "EmailToken" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "Setoran" (
    "id" TEXT NOT NULL,
    "wargaId" TEXT NOT NULL,
    "opsId" TEXT NOT NULL,
    "totalPoin" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setoran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetoranItem" (
    "id" TEXT NOT NULL,
    "setoranId" TEXT NOT NULL,
    "jenisSampahId" TEXT NOT NULL,
    "jenisSampahNama" TEXT NOT NULL,
    "beratKg" DOUBLE PRECISION NOT NULL,
    "poin" INTEGER NOT NULL,

    CONSTRAINT "SetoranItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penukaran" (
    "id" TEXT NOT NULL,
    "wargaId" TEXT NOT NULL,
    "opsId" TEXT NOT NULL,
    "poinDitukar" INTEGER NOT NULL,
    "jumlahRupiah" INTEGER NOT NULL,
    "status" "PenukaranStatus" NOT NULL DEFAULT 'pending',
    "qrToken" TEXT NOT NULL,
    "tokenExpiredAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penukaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Setoran_wargaId_tanggal_idx" ON "Setoran"("wargaId", "tanggal" DESC);

-- CreateIndex
CREATE INDEX "Setoran_opsId_tanggal_idx" ON "Setoran"("opsId", "tanggal" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Penukaran_qrToken_key" ON "Penukaran"("qrToken");

-- CreateIndex
CREATE INDEX "Penukaran_wargaId_createdAt_idx" ON "Penukaran"("wargaId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Penukaran_opsId_createdAt_idx" ON "Penukaran"("opsId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setoran" ADD CONSTRAINT "Setoran_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setoran" ADD CONSTRAINT "Setoran_opsId_fkey" FOREIGN KEY ("opsId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetoranItem" ADD CONSTRAINT "SetoranItem_setoranId_fkey" FOREIGN KEY ("setoranId") REFERENCES "Setoran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penukaran" ADD CONSTRAINT "Penukaran_wargaId_fkey" FOREIGN KEY ("wargaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penukaran" ADD CONSTRAINT "Penukaran_opsId_fkey" FOREIGN KEY ("opsId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "User" ADD CONSTRAINT saldo_nonnegatif CHECK ("saldo_poin" >= 0);
