/**
 * Catálogo na visão da operação.
 *
 * O array público (`lib/products.ts`) segue sendo a única fonte da
 * vitrine — aqui ele é apenas *decorado* com os campos que só o
 * painel conhece (SKU, custo, fornecedor, mínimo, SEO). Nada é
 * duplicado: preço, estoque e descrição continuam vindo de lá.
 *
 * Aos 31 produtos publicados somam-se 2 rascunhos — itens que a
 * loja está preparando e que, por não estarem publicados, não
 * aparecem na vitrine. É o que torna o filtro de status honesto.
 */

import { products } from "@/lib/products";
import type { Product } from "@/lib/types";
import type { AdminProduct } from "./types";
import { createRandom, randInt, pick, round2 } from "./random";
import { NOW, addDays } from "./datetime";

const SUPPLIERS = [
  "Al Nasser Distribuidora",
  "Import Parfums Brasil",
  "Fragrance House SP",
  "JA Importação Direta",
] as const;

/** Rascunhos: lançamentos em preparação, ainda não publicados. */
const drafts: Product[] = [
  {
    id: "p-draft-sublime",
    slug: "lattafa-badee-al-oud-sublime",
    name: "Bade'e Al Oud Sublime",
    brand: "Lattafa",
    origin: "arabe",
    gender: "unissex",
    family: "oriental",
    categorySlug: "arabes",
    subtitle: "Eau de Parfum 100ml",
    description:
      "Lançamento em preparação. Oud cremoso com açafrão e rosa sobre um fundo de âmbar e almíscar. Aguardando fotos e conferência de lote antes da publicação.",
    notes: {
      top: ["Açafrão", "Bergamota"],
      heart: ["Rosa", "Oud"],
      base: ["Âmbar", "Almíscar", "Baunilha"],
    },
    sizeMl: 100,
    concentration: "EDP",
    price: 249.9,
    stock: 0,
    rating: 0,
    reviewCount: 0,
    longevity: 5,
    sillage: 4,
    accent: "#4A2B3A",
    accent2: "#B8879C",
    bottle: "flacon",
  },
  {
    id: "p-draft-untold",
    slug: "armaf-club-de-nuit-untold",
    name: "Club de Nuit Untold",
    brand: "Armaf",
    origin: "arabe",
    gender: "unissex",
    family: "ambar",
    categorySlug: "arabes",
    subtitle: "Eau de Parfum 105ml",
    description:
      "Lançamento em preparação. Âmbar luminoso com açafrão e madeira de cedro. Pedido de importação em trânsito — publicar quando o estoque entrar.",
    notes: {
      top: ["Açafrão", "Jasmim"],
      heart: ["Âmbar", "Cedro"],
      base: ["Almíscar", "Fava tonka"],
    },
    sizeMl: 105,
    concentration: "EDP",
    price: 279.9,
    stock: 0,
    rating: 0,
    reviewCount: 0,
    longevity: 4,
    sillage: 4,
    accent: "#3C4A5E",
    accent2: "#9FB3C8",
    bottle: "tall",
  },
];

/** LAT-ASAD-100 — legível na conferência física, único por construção. */
function buildSku(product: Product, taken: Set<string>): string {
  const clean = (value: string) => value.replace(/[^A-Za-z0-9]/g, "");
  const brandCode = clean(product.brand).slice(0, 3).toUpperCase();
  const nameCode = clean(product.name).slice(0, 4).toUpperCase();
  const base = `${brandCode}-${nameCode}-${product.sizeMl}`;

  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  const unique = `${base}-${suffix}`;
  taken.add(unique);
  return unique;
}

function decorate(
  product: Product,
  index: number,
  taken: Set<string>,
  isDraft: boolean,
): AdminProduct {
  const rng = createRandom(0x5ca1e + index * 7919);
  // Margem típica da perfumaria importada: 38% a 55% sobre a venda.
  const marginRate = 0.38 + rng() * 0.17;
  // Hora comercial, para que a ficha não mostre todos os produtos
  // cadastrados exatamente no mesmo minuto.
  const createdDay = addDays(NOW, -randInt(rng, 40, 900));
  const createdAt = new Date(createdDay);
  createdAt.setUTCHours(12 + randInt(rng, 0, 8), randInt(rng, 0, 59), 0, 0);

  return {
    ...product,
    sku: buildSku(product, taken),
    status: isDraft ? "rascunho" : "ativo",
    cost: round2(product.price * (1 - marginRate)),
    barcode: `789${String(1000000 + index * 34517).padStart(10, "0")}`.slice(
      0,
      13,
    ),
    weightGrams: product.sizeMl + randInt(rng, 140, 260),
    // Caixa com folga para o frasco: a altura acompanha o volume.
    dimensionsCm: {
      length: 8 + Math.round(product.sizeMl / 40),
      width: 7 + Math.round(product.sizeMl / 60),
      height: 11 + Math.round(product.sizeMl / 25),
    },
    fragile: true,
    stockMin: 0, // preenchido em seed.ts a partir da venda real dos últimos 30 dias
    supplier: pick(rng, SUPPLIERS),
    seoTitle: `${product.name} ${product.brand} ${product.sizeMl}ml | JA Store Perfumaria`,
    seoDescription: product.description.slice(0, 155).trim(),
    createdAt: createdAt.toISOString(),
    updatedAt: addDays(createdAt, randInt(rng, 1, 30)).toISOString(),
  };
}

const takenSkus = new Set<string>();

/** Catálogo completo do painel: 31 publicados + 2 rascunhos. */
export const adminProducts: AdminProduct[] = [
  ...products.map((p, i) => decorate(p, i, takenSkus, false)),
  ...drafts.map((p, i) => decorate(p, products.length + i, takenSkus, true)),
];

/** Somente o que a vitrine realmente exibe — base de pedidos e vendas. */
export const sellableProducts: AdminProduct[] = adminProducts.filter(
  (p) => p.status === "ativo",
);

export const productById = (id: string): AdminProduct | undefined =>
  adminProducts.find((p) => p.id === id);
