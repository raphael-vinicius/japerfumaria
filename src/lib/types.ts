/**
 * Modelo de dados do catálogo JA Store Perfumaria.
 * Estruturado para, no futuro, ser substituído por uma API/backend real
 * sem alterar os componentes de apresentação.
 */

export type Origin = "importado" | "arabe" | "nacional";
export type Gender = "masculino" | "feminino" | "unissex";

export type Family =
  | "amadeirado"
  | "oriental"
  | "ambar"
  | "floral"
  | "citrico"
  | "aromatico"
  | "fougere"
  | "gourmand"
  | "aquatico";

export type BottleShape = "tall" | "flacon" | "cube" | "orb";

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  origin: Origin;
  gender: Gender;
  family: Family;
  categorySlug: string;
  subtitle: string;
  description: string;
  notes: FragranceNotes;
  sizeMl: number;
  concentration: "Parfum" | "EDP" | "EDT" | "Body Mist";
  /**
   * Foto real do produto (ex.: "/produtos/lattafa-asad.jpg").
   * Quando presente, substitui a arte vetorial. Basta soltar o arquivo
   * em /public/produtos e preencher este campo — nenhum outro ajuste.
   */
  image?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  bestSeller?: boolean;
  isNew?: boolean;
  featured?: boolean;
  longevity: number; // 1-5
  sillage: number; // 1-5 (projeção)
  accent: string;
  accent2: string;
  bottle: BottleShape;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  accent2: string;
  /**
   * Produto-símbolo exibido no card da categoria (ex.: Árabes → Asad).
   * Se omitido, usa-se o best-seller da categoria automaticamente.
   */
  heroSlug?: string;
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  city: string;
}
