import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { hashPassword, verifyPassword } from "@/lib/password";

beforeEach(resetDb);

describe("password", () => {
  it("hash argon2 terverifikasi; password salah ditolak", async () => {
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("rahasia123") } });
    expect(await verifyPassword(u.id, "rahasia123")).toBe(true);
    expect(await verifyPassword(u.id, "salah")).toBe(false);
  });
  it("user tanpa hash atau tidak dikenal → false", async () => {
    const u = await buatUser(); // passwordHash null
    expect(await verifyPassword(u.id, "apapun")).toBe(false);
    expect(await verifyPassword("id-ngawur", "apapun")).toBe(false);
  });
});
