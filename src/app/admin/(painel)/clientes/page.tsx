import type { Metadata } from "next";
import { CustomersScreen } from "@/components/admin/screens/CustomersScreen";

export const metadata: Metadata = { title: "Clientes" };

export default function CustomersPage() {
  return <CustomersScreen />;
}
