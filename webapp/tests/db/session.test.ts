import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { createSession, deleteSession, getUserByToken } from "@/lib/session";

beforeEach(resetDb);

describe("session", () => {
  it("token valid → user; token asal → null", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    expect((await getUserByToken(token))?.id).toBe(u.id);
    expect(await getUserByToken("ngawur")).toBeNull();
  });
  it("session expired → null dan dibersihkan", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    await prisma.session.update({ where: { token }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await getUserByToken(token)).toBeNull();
    expect(await prisma.session.findUnique({ where: { token } })).toBeNull();
  });
  it("deleteSession mencabut akses", async () => {
    const u = await buatUser();
    const token = await createSession(u.id);
    await deleteSession(token);
    expect(await getUserByToken(token)).toBeNull();
  });
});
