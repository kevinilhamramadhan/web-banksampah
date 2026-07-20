import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "./helpers";
import { listJenisSampah, createJenis, updateTarif, toggleJenis } from "@/lib/jenis-sampah";

beforeEach(resetDb);

describe("jenis-sampah", () => {
  it("createJenis menaruh di urutan terakhir & aktif; list aktifSaja menyaring", async () => {
    const a = await createJenis("Plastik", 5);
    const b = await createJenis("Logam", 8);
    expect(a.urutan).toBe(0);
    expect(b.urutan).toBe(1);
    expect(b.aktif).toBe(true);

    await toggleJenis(a.id); // nonaktifkan
    const aktif = await listJenisSampah(true);
    expect(aktif.map((j) => j.nama)).toEqual(["Logam"]);
    const semua = await listJenisSampah(false);
    expect(semua).toHaveLength(2);
  });

  it("nama unik (P2002) & validasi tarif", async () => {
    await createJenis("Kardus", 5);
    await expect(createJenis("Kardus", 6)).rejects.toMatchObject({ code: "P2002" });
    await expect(createJenis("Kaca", 0)).rejects.toThrow(/tarif/i);
    await expect(createJenis("  ", 5)).rejects.toThrow(/nama/i);
  });

  it("updateTarif mengubah tarif tanpa menyentuh nama/aktif", async () => {
    const j = await createJenis("Botol", 5);
    await updateTarif(j.id, 12);
    const setelah = await prisma.jenisSampah.findUniqueOrThrow({ where: { id: j.id } });
    expect(setelah.tarifPoinPerKg).toBe(12);
    expect(setelah.nama).toBe("Botol");
    expect(setelah.aktif).toBe(true);
    await expect(updateTarif(j.id, -1)).rejects.toThrow(/tarif/i);
  });

  it("toggleJenis membalik status aktif", async () => {
    const j = await createJenis("Kertas", 4);
    const off = await toggleJenis(j.id);
    expect(off.aktif).toBe(false);
    const on = await toggleJenis(j.id);
    expect(on.aktif).toBe(true);
  });
});
