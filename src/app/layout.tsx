import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { CartProvider } from "@/store/CartContext";
import { FavoritesProvider } from "@/store/FavoritesContext";
import { brand, siteUrl } from "@/lib/brand";
import "./globals.css";

// Cormorant Garamond — serifa alta em contraste, delicada e romântica:
// o registro couture da perfumaria feminina (Lancôme/La Vie Est Belle).
const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// Jost — geométrica elegante (herança Futura), o toque chic de boutique
// para navegação, rótulos e texto de interface.
const sans = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — Árabes e Importados | Cabreúva`,
    template: `%s · ${brand.name}`,
  },
  description: brand.descriptionShort,
  keywords: [
    "perfumaria",
    "perfumes importados",
    "perfumes árabes",
    "Lattafa",
    "Armaf",
    "Cabreúva",
    "JA Store Perfumaria",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${brand.name} — Árabes e Importados`,
    description: brand.descriptionShort,
    type: "website",
    locale: "pt_BR",
    siteName: brand.name,
    images: [{ url: "/marca/fachada.jpg", width: 960, height: 1280 }],
  },
  robots: { index: true, follow: true },
};

/** Dados estruturados da loja física (Schema.org LocalBusiness). */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: brand.name,
  description: brand.descriptionShort,
  image: `${siteUrl}/marca/fachada.jpg`,
  telephone: `+55 ${brand.phoneDisplay}`,
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: brand.address.street,
    addressLocality: brand.address.city,
    addressRegion: brand.address.state,
    postalCode: brand.address.zip,
    addressCountry: "BR",
  },
  sameAs: [brand.instagramUrl],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "15:00",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#F8F1EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <FavoritesProvider>
          <CartProvider>{children}</CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
