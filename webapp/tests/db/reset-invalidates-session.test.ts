import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { hashPassword } from "@/lib/password";
import { createSession, getUserByToken } from "@/lib/session";

beforeEach(resetDb);

describe("reset password mencabut semua session", () => {
  it("update passwordHash + deleteMany session → token lama jadi tak valid", async () => {
    const u = await buatUser();
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("lama12345") } });
    const oldToken = await createSession(u.id);
    expect((await getUserByToken(oldToken))?.id).toBe(u.id);

    // Simulasikan inti dari resetPasswordAction: ganti password lalu cabut semua session user.
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword("baru12345") } });
    await prisma.session.deleteMany({ where: { userId: u.id } });

    expect(await getUserByToken(oldToken)).toBeNull();
  });
});
