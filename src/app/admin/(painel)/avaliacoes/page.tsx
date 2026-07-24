import type { Metadata } from "next";
import { ReviewsScreen } from "@/components/admin/screens/ReviewsScreen";

export const metadata: Metadata = { title: "Avaliações" };

export default function ReviewsPage() {
  return <ReviewsScreen />;
}
