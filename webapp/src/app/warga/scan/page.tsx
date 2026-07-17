import { requireRole } from "@/lib/session-next";
import ScanQr from "@/components/ScanQr";

export default async function ScanPage() {
  const user = await requireRole("warga");
  return <ScanQr verified={!!user.emailVerifiedAt} email={user.email} />;
}
