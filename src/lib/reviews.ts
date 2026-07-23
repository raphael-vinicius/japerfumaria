import type { Product, Review } from "./types";

/**
 * Pool de avaliações realistas (pt-BR). São atribuídas de forma
 * determinística a cada produto pelo id, para que a mesma página
 * mostre sempre as mesmas avaliações (sem hidratação inconsistente).
 */
const pool: Omit<Review, "id">[] = [
  {
    author: "Juliana M.",
    initials: "JM",
    rating: 5,
    date: "12 jun 2026",
    title: "Fixação absurda",
    body: "Passei de manhã e no fim do dia ainda sentia. Recebi elogio no trabalho e até no mercado. Superou a expectativa, chegou lacrado e bem embalado.",
    verified: true,
    city: "Cabreúva - SP",
  },
  {
    author: "Rodrigo A.",
    initials: "RA",
    rating: 5,
    date: "03 jun 2026",
    title: "Original e entrega rápida",
    body: "Comprei desconfiado por ser online, mas veio original, com nota e cheirando idêntico ao que testei na loja física. Entrega em Jundiaí no dia seguinte.",
    verified: true,
    city: "Jundiaí - SP",
  },
  {
    author: "Camila R.",
    initials: "CR",
    rating: 5,
    date: "28 mai 2026",
    title: "Meu novo assinatura",
    body: "Simplesmente perfeito. Doce na medida, sem enjoar. Já é o segundo que compro na JA e o atendimento pelo WhatsApp é impecável.",
    verified: true,
    city: "Itu - SP",
  },
  {
    author: "Bruno S.",
    initials: "BS",
    rating: 4,
    date: "21 mai 2026",
    title: "Muito bom, projeção boa",
    body: "Cheiro maravilhoso e recebi vários elogios. Tiro só meia estrela porque no calor forte a fixação cai um pouco, mas ainda assim vale muito.",
    verified: true,
    city: "Salto - SP",
  },
  {
    author: "Fernanda L.",
    initials: "FL",
    rating: 5,
    date: "15 mai 2026",
    title: "Presente que foi sucesso",
    body: "Dei de presente para o meu marido e ele amou. A embalagem para presente é linda, veio com laço e cartão. Recomendo demais.",
    verified: true,
    city: "Cabreúva - SP",
  },
  {
    author: "Diego P.",
    initials: "DP",
    rating: 5,
    date: "09 mai 2026",
    title: "Custo-benefício imbatível",
    body: "Pra quem quer cheirar caro sem gastar uma fortuna, é isso aqui. Desempenho de importado por um preço justo. Voltarei a comprar com certeza.",
    verified: true,
    city: "Campinas - SP",
  },
  {
    author: "Patrícia G.",
    initials: "PG",
    rating: 5,
    date: "30 abr 2026",
    title: "Encantada",
    body: "Chegou antes do prazo, muito bem embrulhado e com um brinde surpresa. O perfume então... maravilhoso, feminino e marcante. Loja de confiança.",
    verified: true,
    city: "Sorocaba - SP",
  },
  {
    author: "Anderson T.",
    initials: "AT",
    rating: 4,
    date: "22 abr 2026",
    title: "Recomendo",
    body: "Segunda compra na loja. Produto original, atendimento atencioso e me ajudaram a escolher pelo WhatsApp. Só demorou um dia a mais que o previsto.",
    verified: true,
    city: "Indaiatuba - SP",
  },
  {
    author: "Larissa V.",
    initials: "LV",
    rating: 5,
    date: "14 abr 2026",
    title: "Viciante",
    body: "Não consigo parar de sentir meu próprio pulso. As pessoas param pra perguntar qual é o perfume. Sensação de luxo por um preço honesto.",
    verified: true,
    city: "Cabreúva - SP",
  },
  {
    author: "Marcos F.",
    initials: "MF",
    rating: 5,
    date: "05 abr 2026",
    title: "Perfeito pro dia a dia",
    body: "Versátil, elegante e agrada todo mundo. Uso pro trabalho e pra sair. A JA embalou com muito capricho, dá gosto de abrir a caixa.",
    verified: true,
    city: "Jundiaí - SP",
  },
  {
    author: "Tatiane B.",
    initials: "TB",
    rating: 5,
    date: "29 mar 2026",
    title: "Melhor perfumaria da região",
    body: "Já sou cliente da loja física e agora comprei pelo site. Mesma qualidade, mesmo cuidado. Confiança total, produto sempre original.",
    verified: true,
    city: "Cabreúva - SP",
  },
  {
    author: "Henrique O.",
    initials: "HO",
    rating: 4,
    date: "18 mar 2026",
    title: "Ótimo, mas queria maior",
    body: "Adorei a fragrância, super elogiada. Só queria que tivesse a versão de 100ml em estoque. De resto, nota dez pra loja e pra entrega.",
    verified: true,
    city: "Várzea Paulista - SP",
  },
];

/** Hash simples e determinístico a partir de string. */
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Retorna N avaliações estáveis para um produto. */
export const reviewsFor = (product: Product, count = 4): Review[] => {
  const start = hash(product.id) % pool.length;
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const base = pool[(start + i) % pool.length];
    out.push({ ...base, id: `${product.id}-rv-${i}` });
  }
  return out;
};

/** Distribuição de estrelas coerente com a média (para a barra de avaliação). */
export const ratingBreakdown = (
  product: Product,
): { star: number; percent: number }[] => {
  const r = product.rating;
  const five = Math.round((r >= 4.8 ? 88 : r >= 4.6 ? 78 : 68));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.round((100 - five - four - three) * 0.5);
  const one = 100 - five - four - three - two;
  return [
    { star: 5, percent: five },
    { star: 4, percent: four },
    { star: 3, percent: three },
    { star: 2, percent: two },
    { star: 1, percent: Math.max(0, one) },
  ];
};
