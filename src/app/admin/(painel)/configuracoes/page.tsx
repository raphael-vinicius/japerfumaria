import type { Metadata } from "next";
import { SettingsScreen } from "@/components/admin/screens/SettingsScreen";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return <SettingsScreen />;
}
