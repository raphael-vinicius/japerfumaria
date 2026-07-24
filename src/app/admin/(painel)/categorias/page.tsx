import type { Metadata } from "next";
import { CategoriesScreen } from "@/components/admin/screens/CategoriesScreen";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return <CategoriesScreen />;
}
