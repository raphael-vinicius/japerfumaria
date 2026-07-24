import type { Metadata } from "next";
import { ProductEditorScreen } from "@/components/admin/screens/ProductEditorScreen";

export const metadata: Metadata = { title: "Editar produto" };

export default function ProductEditorPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProductEditorScreen productId={params.id} />;
}
