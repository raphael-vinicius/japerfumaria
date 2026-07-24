import type { Metadata } from "next";
import { OrderDetailScreen } from "@/components/admin/screens/OrderDetailScreen";

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  return { title: `Pedido #${params.id}` };
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetailScreen orderNumber={params.id} />;
}
