import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";
import { getSessionUser } from "@/lib/session-next";

export default async function WargaLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  // Warga yang belum verifikasi email tidak menampilkan navbar utama
  if (user?.role === "warga" && !user.emailVerifiedAt) {
    return <div className="dgn-konten">{children}</div>;
  }

  return (
    <div className="dgn-nav">
      <AppNav peran={user?.role === "ops" ? "ops" : "warga"} />
      <div className="dgn-konten">{children}</div>
    </div>
  );
}
