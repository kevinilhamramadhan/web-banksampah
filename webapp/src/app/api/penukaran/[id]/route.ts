import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-next";
import { getPenukaran } from "@/lib/penukaran";

/** Dipoll oleh QrFullscreen tiap 2 dtk untuk status penukaran terkini. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ops") {
    return NextResponse.json({ error: "Hanya ops yang boleh melihat status ini." }, { status: 403 });
  }

  const { id } = await params;
  const p = await getPenukaran(id);
  if (!p || p.opsId !== user.id) {
    return NextResponse.json({ error: "Penukaran tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    status: p.status,
    poinDitukar: p.poinDitukar,
    jumlahRupiah: p.jumlahRupiah,
    tokenExpiredAt: p.tokenExpiredAt.toISOString(),
  });
}
