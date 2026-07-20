import { requireRole } from "@/lib/session-next";
import AppHeader from "@/components/AppHeader";
import ScanQr from "@/components/ScanQr";

export default async function ScanPage() {
  const user = await requireRole("warga");
  return (
    <>
      <AppHeader judul="Scan QR Penukaran" />
      <ScanQr verified={!!user.emailVerifiedAt} email={user.email} />
    </>
  );
}
