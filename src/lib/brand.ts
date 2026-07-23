/**
 * Configuração central da marca JA Store Perfumaria.
 * Dados reais extraídos do perfil da loja (Google e Instagram).
 * Centralizado para manter consistência em toda a aplicação.
 */
/** URL canônica do site (protótipo — ajustar ao publicar). */
export const siteUrl = "https://jastoreperfumaria.com.br";

export const brand = {
  name: "JA Store Perfumaria",
  shortName: "JA Store",
  initials: "JA",
  // Texto real da fachada e do logo da loja
  tagline: "Árabes e Importados",
  descriptionShort:
    "Perfumaria em Cabreúva especializada em perfumes árabes e importados originais, com curadoria própria e atendimento de quem entende do assunto.",
  phoneDisplay: "(11) 93448-5614",
  whatsapp: "5511934485614",
  instagram: "jastoreparfum",
  instagramUrl: "https://www.instagram.com/jastoreparfum/",
  googleMapsUrl:
    "https://www.google.com/maps/place/JA+Perfumaria/@-23.2533415,-47.0548234,17z",
  email: "contato@jastoreparfum.com.br",
  founded: 2019,
  rating: 5.0,
  ratingCount: 187,
  address: {
    street: "Rua Fernando Nunes, 797",
    district: "Jacaré",
    city: "Cabreúva",
    state: "SP",
    zip: "13318-130",
    region: "Região Metropolitana de Jundiaí",
    full: "Rua Fernando Nunes, 797 — Jacaré, Cabreúva - SP, 13318-130",
  },
  hours: [
    { day: "Segunda a Sexta", time: "09h00 — 18h30" },
    { day: "Sábado", time: "09h00 — 15h00" },
    { day: "Domingo", time: "Fechado" },
  ],
  shipping: {
    freeThreshold: 299,
    localCity: "Cabreúva",
    localFee: 0,
  },
} as const;

export const waLink = (message: string) =>
  `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`;
