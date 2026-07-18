import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OPS_EMAIL;
  const password = process.env.SEED_OPS_PASSWORD;
  const nama = process.env.SEED_OPS_NAMA ?? "Ops Bank Sampah";

  if (!email || !password) {
    throw new Error("SEED_OPS_EMAIL dan SEED_OPS_PASSWORD wajib diisi di environment.");
  }

  const passwordHash = await hashPassword(password);

  const ops = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ops",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      nama,
      noHp: "-",
      alamat: "-",
      role: "ops",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Akun ops siap: ${ops.email} (id: ${ops.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
