import type { Category } from "./types";

/**
 * Categorias JA Store Perfumaria.
 * Acentos harmonizados com a identidade real "blush & gold" da loja.
 */
export const categories: Category[] = [
  {
    slug: "arabes",
    name: "Árabes",
    tagline: "Intensos, doces e de altíssima fixação",
    description:
      "A curadoria que consagrou a JA: perfumes árabes de casas como Lattafa, Armaf, Al Haramain e Rasasi. Fragrâncias densas, envolventes e com projeção de horas.",
    accent: "#8A5A34",
    accent2: "#CBA06A",
    heroSlug: "lattafa-asad",
  },
  {
    slug: "femininos",
    name: "Femininos",
    tagline: "Florais, gourmands e inesquecíveis",
    description:
      "Importados femininos originais para cada momento — do luminoso de dia ao marcante da noite.",
    accent: "#9A3A5A",
    accent2: "#DE9BB4",
    heroSlug: "carolina-herrera-good-girl",
  },
  {
    slug: "masculinos",
    name: "Masculinos",
    tagline: "Os importados que marcam presença",
    description:
      "Ícones masculinos importados originais, dos amadeirados aromáticos aos âmbares especiados.",
    accent: "#4E6A62",
    accent2: "#9FBFAF",
    heroSlug: "dior-sauvage-eau-de-parfum",
  },
  {
    slug: "unissex",
    name: "Unissex & Nicho",
    tagline: "Fragrâncias sem gênero, com personalidade",
    description:
      "Composições contemporâneas e de nicho pensadas para quem se identifica com elas — não com um rótulo.",
    accent: "#6A4A66",
    accent2: "#B79BC0",
    heroSlug: "mfk-baccarat-rouge-540",
  },
  {
    slug: "kits",
    name: "Kits & Presentes",
    tagline: "Prontos para presentear com carinho",
    description:
      "Conjuntos selecionados a dedo pela equipe JA, com embalagem para presente sem custo adicional.",
    accent: "#9A5540",
    accent2: "#DDA98C",
    heroSlug: "kit-descoberta-arabes",
  },
  {
    slug: "corpo",
    name: "Corpo & Banho",
    tagline: "Body splashes e cremes perfumados",
    description:
      "Brumas corporais e cremes que prolongam a sua fragrância favorita ao longo do dia.",
    accent: "#5E7A66",
    accent2: "#A9C6B0",
    heroSlug: "sol-de-janeiro-brazilian-crush-62",
  },
];

export const getCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);
