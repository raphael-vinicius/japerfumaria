import type { Metadata } from "next";
import { ReportsScreen } from "@/components/admin/screens/ReportsScreen";

export const metadata: Metadata = { title: "Relatórios" };

export default function ReportsPage() {
  return <ReportsScreen />;
}
