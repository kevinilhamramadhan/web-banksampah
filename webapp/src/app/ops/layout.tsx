import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dgn-nav">
      <AppNav peran="ops" />
      <div className="dgn-konten">
        {children}
      </div>
    </div>
  );
}
