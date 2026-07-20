"use server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session-next";
import { listJenisSampah, createJenis, updateTarif, toggleJenis } from "@/lib/jenis-sampah";

export interface JenisDTO {
  id: string;
  nama: string;
  tarifPoinPerKg: number;
  aktif: boolean;
}

async function pastikanOps() {
  const user = await getSessionUser();
  return user && user.role === "ops";
}

function isUniqueError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "P2002";
}

function segarkan() {
  revalidatePath("/ops/jenis-sampah");
  revalidatePath("/ops/setoran");
}

export async function muatJenisAction(): Promise<JenisDTO[] | { error: string }> {
  if (!(await pastikanOps())) return { error: "Anda belum login sebagai ops." };
  const rows = await listJenisSampah(false);
  return rows.map((j) => ({ id: j.id, nama: j.nama, tarifPoinPerKg: j.tarifPoinPerKg, aktif: j.aktif }));
}

export async function tambahJenisAction(nama: string, tarif: number): Promise<{ ok: true } | { error: string }> {
  if (!(await pastikanOps())) return { error: "Anda belum login sebagai ops." };
  try {
    await createJenis(nama, tarif);
    segarkan();
    return { ok: true };
  } catch (e) {
    if (isUniqueError(e)) return { error: "Jenis sampah dengan nama itu sudah ada." };
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

export async function ubahTarifAction(id: string, tarif: number): Promise<{ ok: true } | { error: string }> {
  if (!(await pastikanOps())) return { error: "Anda belum login sebagai ops." };
  try {
    await updateTarif(id, tarif);
    segarkan();
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}

export async function toggleJenisAction(id: string): Promise<{ ok: true } | { error: string }> {
  if (!(await pastikanOps())) return { error: "Anda belum login sebagai ops." };
  try {
    await toggleJenis(id);
    segarkan();
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.constructor === Error) return { error: e.message };
    throw e;
  }
}
