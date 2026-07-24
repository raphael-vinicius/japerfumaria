import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/layout/AdminShell";

/** Todas as telas internas do painel compartilham o mesmo casco. */
export default function PainelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
