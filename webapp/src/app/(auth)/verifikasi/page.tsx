import Link from "next/link";
import { consumeEmailToken } from "@/lib/email";

export default async function VerifikasiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const u = token ? await consumeEmailToken(token, "verify") : null;

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 32 }}>
      <h1>Verifikasi Email</h1>
      {u ? (
        <p className="sukses">Email {u.email} berhasil diverifikasi.</p>
      ) : (
        <p className="error">Tautan verifikasi tidak valid atau sudah kadaluarsa.</p>
      )}
      <div style={{ marginTop: 16 }}>
        <Link href="/login" className="btn">
          Ke halaman login
        </Link>
      </div>
    </div>
  );
}
