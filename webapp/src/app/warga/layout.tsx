import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";
import { getSessionUser } from "@/lib/session-next";

// Navbar mengikuti PERAN pengguna, bukan segmen URL. Penting untuk /warga/peringkat
// yang juga boleh dibuka ops — tanpa ini ops melihat menu warga (Scan/Profil) yang
// justru akan memantulkannya balik ke /ops.
export default async function WargaLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  return (
    <div className="dgn-nav">
      {children}
      <AppNav peran={user?.role === "ops" ? "ops" : "warga"} />
    </div>
  );
}
