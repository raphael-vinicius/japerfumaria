import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Painel administrativo e etapas transacionais não devem ser indexados
      disallow: ["/admin", "/checkout", "/carrinho"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
