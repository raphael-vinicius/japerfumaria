import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminDataProvider } from "@/lib/admin/store";
import { ConfirmProvider } from "@/components/admin/ui/Overlay";
import { ToastProvider } from "@/components/admin/ui/Toast";
import "./admin.css";

/**
 * Raiz do painel — só provedores.
 *
 * O casco visual (sidebar e topo) fica no grupo `(painel)`, para
 * que /admin/login possa renderizar em tela cheia sem ele. O
 * atributo data-admin isola o CSS do painel da vitrine.
 */

export const metadata: Metadata = {
  title: {
    default: "Painel administrativo",
    template: "%s · JA Store Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-admin className="min-h-screen bg-adm-canvas">
      <AdminDataProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </AdminDataProvider>
    </div>
  );
}
