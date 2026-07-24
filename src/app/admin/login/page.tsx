import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/layout/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

/**
 * Acesso ao painel. Fora do grupo `(painel)`, portanto sem sidebar
 * nem topo — a tela de entrada não deve mostrar o que ainda não
 * foi liberado.
 */
export default function AdminLoginPage() {
  return <LoginForm />;
}
