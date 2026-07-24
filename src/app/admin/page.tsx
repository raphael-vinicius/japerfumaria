import { redirect } from "next/navigation";

/** /admin é um atalho — a tela inicial do painel é o dashboard. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
