import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";

export default function WargaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dgn-nav">
      {children}
      <AppNav peran="warga" />
    </div>
  );
}
