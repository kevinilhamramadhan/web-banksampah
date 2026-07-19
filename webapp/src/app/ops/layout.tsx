import type { ReactNode } from "react";
import AppNav from "@/components/AppNav";

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dgn-nav">
      {children}
      <AppNav peran="ops" />
    </div>
  );
}
