import type { Metadata } from "next";
import { CustomerDetailScreen } from "@/components/admin/screens/CustomerDetailScreen";

export const metadata: Metadata = { title: "Ficha do cliente" };

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <CustomerDetailScreen customerId={params.id} />;
}
