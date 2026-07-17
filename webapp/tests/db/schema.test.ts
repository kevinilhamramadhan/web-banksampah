import { beforeEach, describe, expect, it } from "vitest";
import { buatUser, prisma, resetDb } from "./helpers";

beforeEach(resetDb);

describe("constraint saldo", () => {
  it("saldo negatif DITOLAK database", async () => {
    const u = await buatUser({ saldoPoin: 10 });
    await expect(
      prisma.user.update({ where: { id: u.id }, data: { saldoPoin: -1 } }),
    ).rejects.toThrow(/saldo_nonnegatif|constraint/i);
  });
});
