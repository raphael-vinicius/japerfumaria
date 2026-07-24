import type { Metadata } from "next";
import { CouponsScreen } from "@/components/admin/screens/CouponsScreen";

export const metadata: Metadata = { title: "Cupons" };

export default function CouponsPage() {
  return <CouponsScreen />;
}
