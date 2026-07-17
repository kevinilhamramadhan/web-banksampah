import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";
import { consumeEmailToken, createEmailToken } from "@/lib/email";

beforeEach(resetDb);

describe("email token", () => {
  it("verify: sekali pakai dan menandai emailVerifiedAt", async () => {
    const u = await buatUser();
    const t = await createEmailToken(u.id, "verify");
    const hasil = await consumeEmailToken(t, "verify");
    expect(hasil?.id).toBe(u.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).emailVerifiedAt).toBeTruthy();
    expect(await consumeEmailToken(t, "verify")).toBeNull(); // replay
  });
  it("expired dan type salah → null", async () => {
    const u = await buatUser();
    const t = await createEmailToken(u.id, "reset");
    expect(await consumeEmailToken(t, "verify")).toBeNull(); // type salah
    await prisma.emailToken.update({ where: { token: t }, data: { expiresAt: new Date(Date.now() - 1) } });
    expect(await consumeEmailToken(t, "reset")).toBeNull();
  });
});
