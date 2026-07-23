import type { Product, Origin, Gender, Family } from "./types";
import { products } from "./products";

export type SortKey =
  | "relevancia"
  | "menor-preco"
  | "maior-preco"
  | "mais-vendidos"
  | "melhor-avaliados"
  | "lancamentos";

export interface Filters {
  query?: string;
  categories?: string[];
  origins?: Origin[];
  genders?: Gender[];
  families?: Family[];
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  onlyInStock?: boolean;
  onlyPromo?: boolean;
  sort?: SortKey;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const matchesQuery = (p: Product, q: string): boolean => {
  const n = normalize(q);
  return [p.name, p.brand, p.family, p.subtitle, p.description]
    .map(normalize)
    .some((f) => f.includes(n));
};

export const filterProducts = (filters: Filters): Product[] => {
  let list = [...products];

  if (filters.query?.trim()) {
    const q = filters.query.trim();
    list = list.filter((p) => matchesQuery(p, q));
  }
  if (filters.categories?.length)
    list = list.filter((p) => filters.categories!.includes(p.categorySlug));
  if (filters.origins?.length)
    list = list.filter((p) => filters.origins!.includes(p.origin));
  if (filters.genders?.length)
    list = list.filter((p) => filters.genders!.includes(p.gender));
  if (filters.families?.length)
    list = list.filter((p) => filters.families!.includes(p.family));
  if (filters.brands?.length)
    list = list.filter((p) => filters.brands!.includes(p.brand));
  if (typeof filters.priceMin === "number")
    list = list.filter((p) => p.price >= filters.priceMin!);
  if (typeof filters.priceMax === "number")
    list = list.filter((p) => p.price <= filters.priceMax!);
  if (filters.onlyInStock) list = list.filter((p) => p.stock > 0);
  if (filters.onlyPromo) list = list.filter((p) => !!p.compareAtPrice);

  switch (filters.sort) {
    case "menor-preco":
      list.sort((a, b) => a.price - b.price);
      break;
    case "maior-preco":
      list.sort((a, b) => b.price - a.price);
      break;
    case "mais-vendidos":
      list.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "melhor-avaliados":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "lancamentos":
      list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
      break;
    default:
      // relevância: destaques e mais vendidos primeiro
      list.sort(
        (a, b) =>
          Number(!!b.featured) - Number(!!a.featured) ||
          b.reviewCount - a.reviewCount,
      );
  }
  return list;
};

/** Sugestões rápidas para o campo de busca. */
export const searchSuggestions = (query: string, limit = 6): Product[] => {
  if (!query.trim()) return [];
  return products.filter((p) => matchesQuery(p, query)).slice(0, limit);
};
