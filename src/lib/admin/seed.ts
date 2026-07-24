/**
 * ————————————————————————————————————————————————————————————
 *  Base simulada do painel — 100% fictícia, 100% coerente.
 * ————————————————————————————————————————————————————————————
 *  Pessoas, endereços e documentos são inventados. O que NÃO é
 *  inventado é a relação entre os dados: todo pedido aponta para
 *  um cliente que existe e para produtos que existem no catálogo;
 *  todo total é a soma dos seus itens; o reservado do estoque sai
 *  dos pedidos em aberto; o uso de cada cupom é contado nos
 *  pedidos que o usaram; as avaliações vêm de pedidos entregues.
 *
 *  Nada é sorteado em tempo de render: uma semente fixa garante
 *  a mesma base em toda build, no servidor e no cliente.
 *
 *  Para plugar um backend, só este arquivo (e `source.ts`) muda.
 * ———————————————————————————————————————————————————————————— */

import { brand } from "@/lib/brand";
import { adminProducts, sellableProducts } from "./catalog";
import { CHANNEL } from "./labels";
import {
  NOW,
  addDays,
  addBusinessDays,
  daysBetween,
  dayKey,
  startOfDay,
} from "./datetime";
import {
  createRandom,
  randInt,
  pick,
  weighted,
  chance,
  round2,
  type Random,
} from "./random";
import type {
  Address,
  AdminCoupon,
  AdminProduct,
  AdminReview,
  Customer,
  CustomerTag,
  Order,
  OrderEvent,
  OrderItem,
  OrderNote,
  OrderStatus,
  PaymentMethod,
  ReviewStatus,
  SalesChannel,
  StaffUser,
  StockMovement,
  StoreSettings,
} from "./types";

const rng: Random = createRandom(20260723);

/* ————————————————————————— Equipe ————————————————————————— */

export const staff: StaffUser[] = [
  {
    id: "u-bruno",
    name: "Bruno Henrique",
    email: "bruno@jastoreparfum.com.br",
    role: "proprietario",
    active: true,
    lastAccessAt: addDays(NOW, 0).toISOString(),
    initials: "BH",
  },
];

/** Usuário da sessão do painel (protótipo: sempre o proprietário). */
export const currentUser = staff[0];

/**
 * Autores das ações históricas. A loja tem um único responsável,
 * então toda operação registrada é dele.
 */
const OPERATORS = ["Bruno Henrique"] as const;
const SYSTEM = "Sistema";

/* ———————————————————————— Geografia ———————————————————————— */

interface CityDef {
  city: string;
  state: string;
  cepPrefix: string;
  districts: string[];
  /** Cidade da loja — habilita retirada e entrega própria. */
  local?: boolean;
  weight: number;
}

const CITIES: CityDef[] = [
  {
    city: "Cabreúva",
    state: "SP",
    cepPrefix: "13315",
    districts: ["Jacaré", "Centro", "Bonfim", "Pinhal"],
    local: true,
    weight: 26,
  },
  {
    city: "Jundiaí",
    state: "SP",
    cepPrefix: "13209",
    districts: ["Anhangabaú", "Vianelo", "Centro", "Jardim Ana Maria"],
    weight: 20,
  },
  {
    city: "Itu",
    state: "SP",
    cepPrefix: "13301",
    districts: ["Centro", "Vila Nova", "Brasil"],
    weight: 12,
  },
  {
    city: "Salto",
    state: "SP",
    cepPrefix: "13320",
    districts: ["Centro", "Vila Nova", "Jardim Panorama"],
    weight: 9,
  },
  {
    city: "Indaiatuba",
    state: "SP",
    cepPrefix: "13330",
    districts: ["Cidade Nova", "Centro", "Vila Furlan"],
    weight: 8,
  },
  {
    city: "Campinas",
    state: "SP",
    cepPrefix: "13010",
    districts: ["Cambuí", "Taquaral", "Centro", "Barão Geraldo"],
    weight: 8,
  },
  {
    city: "Itupeva",
    state: "SP",
    cepPrefix: "13295",
    districts: ["Centro", "Horizonte Azul", "Monte Serrat"],
    weight: 6,
  },
  {
    city: "Várzea Paulista",
    state: "SP",
    cepPrefix: "13220",
    districts: ["Centro", "Jardim América"],
    weight: 5,
  },
  {
    city: "Louveira",
    state: "SP",
    cepPrefix: "13290",
    districts: ["Centro", "Jardim Nossa Senhora de Fátima"],
    weight: 4,
  },
  {
    city: "Vinhedo",
    state: "SP",
    cepPrefix: "13280",
    districts: ["Centro", "Capela"],
    weight: 4,
  },
  {
    city: "Sorocaba",
    state: "SP",
    cepPrefix: "18035",
    districts: ["Campolim", "Centro", "Além Ponte"],
    weight: 4,
  },
  {
    city: "São Paulo",
    state: "SP",
    cepPrefix: "05422",
    districts: ["Pinheiros", "Vila Madalena", "Moema", "Santana"],
    weight: 4,
  },
];

const STREETS = [
  "Rua das Acácias",
  "Rua Fernando Nunes",
  "Avenida Brasil",
  "Rua Sete de Setembro",
  "Rua João Pessoa",
  "Avenida dos Ipês",
  "Rua Marechal Deodoro",
  "Rua Santa Cruz",
  "Rua dos Jasmins",
  "Avenida Paulo Camilo",
  "Rua Barão de Jundiaí",
  "Rua Padre Anchieta",
  "Rua das Palmeiras",
  "Avenida Nove de Julho",
];

const COMPLEMENTS = [
  undefined,
  "Apto 42",
  "Casa 2",
  "Bloco B, apto 71",
  "Fundos",
  "Apto 103",
];

function buildAddress(random: Random, cityDef: CityDef): Address {
  const suffix = String(randInt(random, 100, 999));
  return {
    zip: `${cityDef.cepPrefix}-${suffix.slice(0, 3)}`,
    street: pick(random, STREETS),
    number: String(randInt(random, 12, 1890)),
    complement: pick(random, COMPLEMENTS),
    district: pick(random, cityDef.districts),
    city: cityDef.city,
    state: cityDef.state,
  };
}

/* ———————————————————————— Clientes ———————————————————————— */

const FIRST_NAMES = [
  "Camila", "Patrícia", "Fernanda", "Larissa", "Tatiane", "Juliana",
  "Aline", "Bruna", "Vanessa", "Priscila", "Simone", "Débora",
  "Rodrigo", "Bruno", "Diego", "Anderson", "Henrique", "Lucas",
  "Rafael", "Thiago", "Gustavo", "Marcelo", "Eduardo", "Felipe",
  "Sabrina", "Carolina", "Mariana", "Renata", "Amanda", "Letícia",
];

const LAST_NAMES = [
  "Rodrigues", "Gomes", "Lima", "Vieira", "Barbosa", "Oliveira",
  "Santos", "Pereira", "Teixeira", "Almeida", "Carvalho", "Ribeiro",
  "Nogueira", "Moraes", "Batista", "Cardoso", "Fonseca", "Andrade",
];

const EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"];

const slugifyName = (value: string) =>
  value
    .normalize("NFD")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** CPF sintético com dígitos verificadores válidos (pessoa fictícia). */
function buildCpf(random: Random): string {
  const digits = Array.from({ length: 9 }, () => randInt(random, 0, 9));
  const checkDigit = (base: number[]) => {
    const weight = base.length + 1;
    const sum = base.reduce((acc, n, i) => acc + n * (weight - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = checkDigit(digits);
  const d2 = checkDigit([...digits, d1]);
  const all = [...digits, d1, d2].join("");
  return `${all.slice(0, 3)}.${all.slice(3, 6)}.${all.slice(6, 9)}-${all.slice(9)}`;
}

const buildPhone = (random: Random) =>
  `(11) 9${randInt(random, 1000, 9999)}-${randInt(random, 1000, 9999)}`;

interface SeedCustomer extends Customer {
  /** Peso de recompra — define quem são os clientes fiéis. */
  weight: number;
  cityDef: CityDef;
}

function buildCustomers(): SeedCustomer[] {
  const usedNames = new Set<string>();
  const usedEmails = new Set<string>();
  const list: SeedCustomer[] = [];

  for (let i = 0; i < 112; i++) {
    let name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
    let guard = 0;
    while (usedNames.has(name) && guard < 40) {
      name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
      guard += 1;
    }
    usedNames.add(name);

    const [first, last] = name.split(" ");
    let email = `${slugifyName(first)}.${slugifyName(last)}@${pick(rng, EMAIL_DOMAINS)}`;
    if (usedEmails.has(email)) email = `${slugifyName(first)}.${slugifyName(last)}${i}@${pick(rng, EMAIL_DOMAINS)}`;
    usedEmails.add(email);

    const cityDef = weighted(
      rng,
      CITIES.map((c) => [c, c.weight] as const),
    );
    const addresses = [buildAddress(rng, cityDef)];
    // Uma minoria mantém um segundo endereço (trabalho ou presente).
    if (chance(rng, 0.22)) addresses.push(buildAddress(rng, cityDef));

    list.push({
      id: `c-${String(i + 1).padStart(3, "0")}`,
      name,
      email,
      phone: buildPhone(rng),
      cpf: buildCpf(rng),
      birthDate: addDays(NOW, -randInt(rng, 6600, 18000)).toISOString(),
      // Cadastros concentrados nos meses recentes: a loja cresce, e
      // uma base plana ao longo de 3 anos faria "novos clientes"
      // ser sempre zero no relatório do mês.
      // Meia-noite do dia do cadastro: assim um pedido feito no
      // mesmo dia continua sendo posterior ao cadastro.
      createdAt: startOfDay(
        addDays(NOW, -Math.round(1000 * Math.pow(rng(), 1.5))),
      ).toISOString(),
      addresses,
      tags: [],
      notes: [],
      acceptsMarketing: chance(rng, 0.72),
      weight: weighted(rng, [
        [1, 50],
        [3, 28],
        [7, 15],
        [14, 7],
      ]),
      cityDef,
    });
  }
  return list;
}

const seedCustomers = buildCustomers();

/* ————————————————————————— Cupons ————————————————————————— */

const couponDefs: Omit<AdminCoupon, "used">[] = [
  {
    id: "cp-bemvindo10",
    code: "BEMVINDO10",
    description: "10% na primeira compra",
    type: "percent",
    value: 10,
    startsAt: addDays(NOW, -400).toISOString(),
    usageLimit: 500,
    active: true,
  },
  {
    id: "cp-arabes15",
    code: "ARABES15",
    description: "15% na linha de árabes",
    type: "percent",
    value: 15,
    startsAt: addDays(NOW, -180).toISOString(),
    endsAt: addDays(NOW, 38).toISOString(),
    usageLimit: 200,
    minSubtotal: 250,
    active: true,
  },
  {
    id: "cp-freteja",
    code: "FRETEJA",
    description: "Frete grátis para todo o Brasil",
    type: "free_shipping",
    value: 0,
    startsAt: addDays(NOW, -120).toISOString(),
    usageLimit: 300,
    minSubtotal: 199,
    active: true,
  },
  {
    id: "cp-julho20",
    code: "JULHO20",
    description: "20% na campanha de julho",
    type: "percent",
    value: 20,
    startsAt: addDays(NOW, -22).toISOString(),
    endsAt: addDays(NOW, 8).toISOString(),
    usageLimit: 150,
    minSubtotal: 299,
    active: true,
  },
  {
    id: "cp-volta25",
    code: "VOLTA25",
    description: "R$ 25 para quem não compra há 90 dias",
    type: "fixed",
    value: 25,
    startsAt: addDays(NOW, -60).toISOString(),
    usageLimit: 120,
    minSubtotal: 199,
    active: false,
  },
  {
    id: "cp-diadasmaes",
    code: "MAES30",
    description: "30% na campanha do Dia das Mães",
    type: "percent",
    value: 30,
    startsAt: addDays(NOW, -95).toISOString(),
    endsAt: addDays(NOW, -70).toISOString(),
    usageLimit: 200,
    active: true,
  },
  {
    id: "cp-agosto",
    code: "AGOSTO10",
    description: "10% na campanha de agosto (agendado)",
    type: "percent",
    value: 10,
    startsAt: addDays(NOW, 9).toISOString(),
    endsAt: addDays(NOW, 40).toISOString(),
    usageLimit: 250,
    active: true,
  },
];

/* ————————————————————————— Pedidos ————————————————————————— */

const CUSTOMER_MESSAGES = [
  "É presente — favor não incluir a nota fiscal na caixa.",
  "Se possível, entregar após as 18h. Obrigada!",
  "Podem embrulhar para presente? Aniversário no sábado.",
  "Deixar com o porteiro caso eu não esteja.",
  "Preciso até sexta, é presente de casamento.",
];

const INTERNAL_NOTES = [
  "Cliente pediu embrulho para presente — separado com laço dourado.",
  "Confirmado por WhatsApp que o endereço está correto.",
  "Cliente recorrente, incluir amostra de cortesia.",
  "Ligou perguntando o prazo; informei previsão de entrega.",
  "Endereço corrigido pelo cliente antes da separação.",
];

const CANCEL_REASONS = [
  "Cancelado a pedido do cliente",
  "Pagamento não confirmado no prazo",
  "Produto indisponível no lote recebido",
  "Cliente pediu troca por outro modelo — novo pedido gerado",
];

const CARD_BRANDS = ["Visa", "Mastercard", "Elo", "Hipercard"] as const;

const money = (value: number) => round2(value);

/**
 * Probabilidade de um produto entrar num pedido. Destaque no site
 * puxa para cima; preço puxa para baixo. O giro real da JA está nos
 * árabes de R$ 180 a R$ 250 — o nicho de R$ 1.900 vende, mas raro.
 */
const demandWeight = (product: AdminProduct): number => {
  const exposure = product.bestSeller
    ? 6
    : product.featured
      ? 4
      : product.isNew
        ? 3
        : 2;
  const priceFactor = Math.min(2.4, (320 / product.price) ** 1.6);
  return exposure * priceFactor;
};

const DEMAND_TABLE = sellableProducts.map(
  (p) => [p, demandWeight(p)] as const,
);

function buildItems(random: Random): OrderItem[] {
  const count = weighted(random, [
    [1, 58],
    [2, 27],
    [3, 11],
    [4, 4],
  ]);
  const chosen: AdminProduct[] = [];
  let guard = 0;
  while (chosen.length < count && guard < 40) {
    guard += 1;
    const product = weighted(random, DEMAND_TABLE);
    if (!chosen.some((c) => c.id === product.id)) chosen.push(product);
  }

  return chosen.map((product) => {
    const quantity = weighted(random, [
      [1, 86],
      [2, 12],
      [3, 2],
    ]);
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      image: product.image,
      unitPrice: product.price,
      quantity,
      total: money(product.price * quantity),
    };
  });
}

function statusForAge(random: Random, ageDays: number): OrderStatus {
  if (ageDays >= 12)
    return weighted(random, [
      ["entregue", 94],
      ["cancelado", 6],
    ] as const);
  if (ageDays >= 7)
    return weighted(random, [
      ["entregue", 76],
      ["enviado", 18],
      ["cancelado", 6],
    ] as const);
  if (ageDays >= 4)
    return weighted(random, [
      ["enviado", 52],
      ["entregue", 32],
      ["separando", 9],
      ["cancelado", 7],
    ] as const);
  if (ageDays >= 2)
    return weighted(random, [
      ["enviado", 44],
      ["separando", 26],
      ["pago", 14],
      ["entregue", 9],
      ["cancelado", 7],
    ] as const);
  if (ageDays === 1)
    return weighted(random, [
      ["separando", 33],
      ["pago", 27],
      ["enviado", 22],
      ["aguardando_pagamento", 12],
      ["cancelado", 6],
    ] as const);
  return weighted(random, [
    ["pago", 34],
    ["aguardando_pagamento", 33],
    ["separando", 25],
    ["enviado", 8],
  ] as const);
}

/** Mix de estados do dia corrente — garante fila de trabalho real. */
const TODAY_STATUSES: OrderStatus[] = [
  "pago",
  "aguardando_pagamento",
  "separando",
  "pago",
  "aguardando_pagamento",
];

/** Curva de horário da loja: pico entre 18h e 20h. */
const HOUR_WEIGHTS: readonly (readonly [number, number])[] = [
  [9, 6], [10, 8], [11, 9], [12, 7], [13, 6], [14, 8], [15, 9],
  [16, 10], [17, 11], [18, 12], [19, 13], [20, 12], [21, 9], [22, 6],
];

const STATUS_RANK: Record<OrderStatus, number> = {
  aguardando_pagamento: 0,
  pago: 1,
  separando: 2,
  enviado: 3,
  entregue: 4,
  cancelado: 5,
};

function buildOrders(): Order[] {
  const orders: Order[] = [];
  const DAYS = 120;
  let sequence = 1000;

  for (let offset = DAYS; offset >= 0; offset--) {
    const day = addDays(NOW, -offset);
    const weekday = day.getUTCDay();
    // Sábado é o pico da perfumaria; domingo, o vale.
    const weekdayFactor = [0.45, 0.95, 1, 1.05, 1.1, 1.3, 1.25][weekday];
    // Crescimento suave ao longo do período.
    const trend = 0.8 + ((DAYS - offset) / DAYS) * 0.55;
    const base = 1.9 * weekdayFactor * trend;
    const count =
      offset === 0
        ? 5 // o dia corrente sempre tem operação para o dashboard mostrar
        : Math.max(0, Math.round(base + (rng() * 1.5 - 0.7)));

    for (let i = 0; i < count; i++) {
      sequence += 1;

      // Ninguém compra antes de existir: o sorteio só considera
      // quem já estava cadastrado na data do pedido.
      const eligible = seedCustomers.filter(
        (c) => new Date(c.createdAt).getTime() <= day.getTime(),
      );
      if (!eligible.length) continue;
      const customer = weighted(
        rng,
        eligible.map((c) => [c, c.weight] as const),
      );
      const cityDef = customer.cityDef;
      const address = pick(rng, customer.addresses);

      // Hora do pedido concentrada no fim da tarde e à noite. No dia
      // corrente, só até a hora atual — a loja não vende no futuro.
      const currentHour = Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          hour12: false,
        }).format(NOW),
      );
      const hourTable =
        offset === 0
          ? HOUR_WEIGHTS.filter(([h]) => h < currentHour)
          : HOUR_WEIGHTS;
      const hour = weighted(rng, hourTable);
      const createdAt = new Date(
        `${dayKey(day)}T${String(hour).padStart(2, "0")}:${String(randInt(rng, 0, 59)).padStart(2, "0")}:00-03:00`,
      );
      if (createdAt.getTime() > NOW.getTime()) continue;

      const items = buildItems(rng);
      const subtotal = money(items.reduce((sum, item) => sum + item.total, 0));

      // Cupom: só entra se estiver vigente na data e se o pedido qualificar.
      let couponCode: string | undefined;
      let discount = 0;
      let freeShipping = false;
      if (chance(rng, 0.24)) {
        const valid = couponDefs.filter((c) => {
          const started = new Date(c.startsAt).getTime() <= createdAt.getTime();
          const ended = c.endsAt
            ? new Date(c.endsAt).getTime() < createdAt.getTime()
            : false;
          const qualifies = !c.minSubtotal || subtotal >= c.minSubtotal;
          return started && !ended && qualifies;
        });
        if (valid.length) {
          const coupon = pick(rng, valid);
          couponCode = coupon.code;
          if (coupon.type === "percent")
            discount = money((subtotal * coupon.value) / 100);
          else if (coupon.type === "fixed")
            discount = money(Math.min(coupon.value, subtotal * 0.5));
          else freeShipping = true;
        }
      }

      // Frete: retirada e entrega própria em Cabreúva; Correios no resto.
      const shippingChoice = cityDef.local
        ? weighted(rng, [
            ["retirada", 34],
            ["local", 66],
          ] as const)
        : weighted(rng, [
            ["padrao", 68],
            ["expressa", 32],
          ] as const);

      const afterDiscount = subtotal - discount;
      let shippingFee = 0;
      let shippingLabel = "Retirada na loja";
      let method: Order["shipping"]["method"] = "retirada";
      let estimateDays = 0;
      let carrier: string | undefined;

      if (shippingChoice === "local") {
        method = "padrao";
        shippingLabel = "Entrega local — Cabreúva";
        shippingFee = 0;
        estimateDays = 1;
        carrier = "Entrega própria";
      } else if (shippingChoice === "padrao") {
        method = "padrao";
        shippingLabel = "Correios PAC";
        shippingFee =
          afterDiscount >= brand.shipping.freeThreshold ? 0 : 24.9;
        estimateDays = 5;
        carrier = "Correios";
      } else if (shippingChoice === "expressa") {
        method = "expressa";
        shippingLabel = "Correios SEDEX";
        shippingFee = 34.9;
        estimateDays = 2;
        carrier = "Correios";
      }
      if (freeShipping) shippingFee = 0;

      const total = money(afterDiscount + shippingFee);

      const ageDays = daysBetween(createdAt, NOW);
      let status = statusForAge(rng, ageDays);
      // O dia corrente recebe um mix fixo de estados. Deixar isso
      // ao sorteio faz o painel abrir, de vez em quando, sem nada
      // na fila — e a fila é justamente o que ele existe para
      // mostrar. (O sorteio acima continua sendo consumido para
      // não deslocar a sequência determinística.)
      if (offset === 0) status = TODAY_STATUSES[i % TODAY_STATUSES.length];
      // Retirada na loja não passa por "enviado".
      if (method === "retirada" && status === "enviado")
        status = ageDays >= 3 ? "entregue" : "separando";

      const paymentMethod: PaymentMethod = weighted(rng, [
        ["pix", 52],
        ["credito", 40],
        ["boleto", 8],
      ] as const);
      const installments =
        paymentMethod === "credito"
          ? weighted(rng, [
              [1, 34], [2, 14], [3, 18], [4, 10],
              [6, 14], [10, 10],
            ] as const)
          : 1;

      const channel: SalesChannel = weighted(rng, [
        ["site", 56],
        ["whatsapp", 24],
        ["loja", 12],
        ["instagram", 8],
      ] as const);

      const rank = STATUS_RANK[status];
      const paid = rank >= 1 && status !== "cancelado";
      const cancelledBeforePayment = status === "cancelado" && chance(rng, 0.45);

      // ——— Linha do tempo: cada evento herda o horário do anterior ———
      const timeline: OrderEvent[] = [
        {
          id: `${sequence}-e1`,
          at: createdAt.toISOString(),
          type: "criado",
          label: "Pedido realizado",
          detail: `Origem: ${CHANNEL[channel]}`,
          author: SYSTEM,
        },
      ];

      const paymentDelayMs =
        paymentMethod === "pix"
          ? randInt(rng, 2, 40) * 60_000
          : paymentMethod === "credito"
            ? randInt(rng, 1, 5) * 60_000
            : randInt(rng, 18, 46) * 3600_000;
      const paidAt = new Date(createdAt.getTime() + paymentDelayMs);

      if (paid || (status === "cancelado" && !cancelledBeforePayment)) {
        timeline.push({
          id: `${sequence}-e2`,
          at: paidAt.toISOString(),
          type: "pagamento",
          label: "Pagamento aprovado",
          detail: paymentDetail(paymentMethod, installments),
          author: SYSTEM,
        });
      }

      const pickedAt = new Date(
        paidAt.getTime() + randInt(rng, 2, 20) * 3600_000,
      );
      if (rank >= 2 && status !== "cancelado") {
        timeline.push({
          id: `${sequence}-e3`,
          at: pickedAt.toISOString(),
          type: "separacao",
          label: "Em separação",
          detail: `${items.length} ${items.length === 1 ? "item conferido" : "itens conferidos"} no estoque`,
          author: pick(rng, OPERATORS),
        });
      }

      const shippedAt = new Date(
        pickedAt.getTime() + randInt(rng, 3, 26) * 3600_000,
      );
      let trackingCode: string | undefined;
      if (rank >= 3 && status !== "cancelado") {
        if (carrier === "Correios") {
          trackingCode = `${method === "expressa" ? "SE" : "PB"}${randInt(rng, 100000000, 999999999)}BR`;
        }
        timeline.push({
          id: `${sequence}-e4`,
          at: shippedAt.toISOString(),
          type: "envio",
          label:
            method === "retirada" ? "Disponível para retirada" : "Pedido enviado",
          detail: trackingCode
            ? `${shippingLabel} · ${trackingCode}`
            : shippingLabel,
          author: pick(rng, OPERATORS),
        });
      }

      const deliveredAt = addBusinessDays(shippedAt, estimateDays || 1);
      if (status === "entregue") {
        timeline.push({
          id: `${sequence}-e5`,
          at: deliveredAt.toISOString(),
          type: "entrega",
          label:
            method === "retirada" ? "Retirado pelo cliente" : "Entrega concluída",
          detail:
            method === "retirada"
              ? "Retirada confirmada no balcão"
              : `Recebido por ${customer.name.split(" ")[0]}`,
          author: method === "retirada" ? pick(rng, OPERATORS) : SYSTEM,
        });
      }

      if (status === "cancelado") {
        const cancelAt = new Date(
          (cancelledBeforePayment ? createdAt : paidAt).getTime() +
            randInt(rng, 4, 40) * 3600_000,
        );
        timeline.push({
          id: `${sequence}-e6`,
          at: cancelAt.toISOString(),
          type: "cancelamento",
          label: "Pedido cancelado",
          detail: pick(rng, CANCEL_REASONS),
          author: pick(rng, OPERATORS),
        });
      }

      timeline.sort((a, b) => a.at.localeCompare(b.at));
      const lastEvent = timeline[timeline.length - 1];

      const notes: OrderNote[] = chance(rng, 0.18)
        ? [
            {
              id: `${sequence}-n1`,
              at: new Date(
                createdAt.getTime() + randInt(rng, 1, 20) * 3600_000,
              ).toISOString(),
              author: pick(rng, OPERATORS),
              body: pick(rng, INTERNAL_NOTES),
            },
          ]
        : [];

      orders.push({
        id: `ord-${sequence}`,
        number: sequence,
        customerId: customer.id,
        createdAt: createdAt.toISOString(),
        updatedAt: lastEvent.at,
        status,
        channel,
        items,
        payment: {
          method: paymentMethod,
          status:
            status === "cancelado"
              ? cancelledBeforePayment
                ? "recusado"
                : "estornado"
              : paid
                ? "aprovado"
                : "pendente",
          installments,
          cardBrand:
            paymentMethod === "credito" ? pick(rng, CARD_BRANDS) : undefined,
          cardLast4:
            paymentMethod === "credito"
              ? String(randInt(rng, 1000, 9999))
              : undefined,
          transactionId: `TX-${dayKey(createdAt).replace(/-/g, "")}-${sequence}`,
          paidAt: paid ? paidAt.toISOString() : undefined,
        },
        shipping: {
          method,
          label: shippingLabel,
          fee: shippingFee,
          address,
          carrier,
          trackingCode,
          shippedAt:
            rank >= 3 && status !== "cancelado"
              ? shippedAt.toISOString()
              : undefined,
          deliveredAt:
            status === "entregue" ? deliveredAt.toISOString() : undefined,
          estimateDays,
        },
        couponCode,
        subtotal,
        discount,
        total,
        timeline,
        notes,
        customerMessage: chance(rng, 0.12)
          ? pick(rng, CUSTOMER_MESSAGES)
          : undefined,
      });
    }
  }

  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function paymentDetail(method: PaymentMethod, installments: number): string {
  if (method === "pix") return "Pix — confirmação automática";
  if (method === "boleto") return "Boleto bancário compensado";
  return installments > 1
    ? `Cartão de crédito — ${installments}x`
    : "Cartão de crédito — à vista";
}

export const seedOrders: Order[] = buildOrders();

/* ———————— Clientes: datas e tags derivadas dos pedidos ———————— */

export const seedCustomerList: Customer[] = seedCustomers.map(
  ({ weight, cityDef, ...customer }) => {
    const own = seedOrders.filter(
      (o) => o.customerId === customer.id && o.status !== "cancelado",
    );
    const spent = own.reduce((sum, o) => sum + o.total, 0);
    const firstOrder = own[own.length - 1];

    // O cadastro nunca pode ser posterior ao primeiro pedido.
    const createdAt =
      firstOrder && firstOrder.createdAt < customer.createdAt
        ? firstOrder.createdAt
        : customer.createdAt;

    const tags: CustomerTag[] = [];
    if (spent >= 2000 || own.length >= 8) tags.push("vip");
    else if (own.length >= 3) tags.push("recorrente");
    else tags.push("novo");
    if (own.some((o) => o.items.reduce((s, i) => s + i.quantity, 0) >= 4))
      tags.push("atacado");

    return { ...customer, createdAt, tags };
  },
);

/* ————————————— Produtos: mínimo derivado da venda ————————————— */

const soldLast30 = new Map<string, number>();
for (const order of seedOrders) {
  if (order.status === "cancelado") continue;
  if (daysBetween(order.createdAt, NOW) > 30) continue;
  for (const item of order.items) {
    soldLast30.set(
      item.productId,
      (soldLast30.get(item.productId) ?? 0) + item.quantity,
    );
  }
}

export const seedProducts: AdminProduct[] = adminProducts.map((product) => ({
  ...product,
  /**
   * Ponto de reposição = demanda durante o tempo de reposição.
   * Entre pedir e receber passam ~36 dias (importação com folga de
   * conferência), o que dá 1,2× a venda mensal. O piso de 4
   * unidades protege o giro lento e caro: ficar sem o único frasco
   * de um nicho por um mês é pior do que carregar três a mais.
   */
  stockMin: Math.min(
    40,
    Math.max(4, Math.round((soldLast30.get(product.id) ?? 0) * 1.2)),
  ),
}));

/* ————————————————————— Movimentos de estoque ————————————————————— */

const RESTOCK_REASONS = [
  "Reposição — pedido de importação",
  "Entrada de nota fiscal",
  "Recebimento de lote",
];

const ADJUST_REASONS = [
  "Inventário — divergência de contagem",
  "Avaria identificada na conferência",
  "Devolução do cliente reintegrada",
  "Amostra aberta para o balcão",
];

function buildStockMovements(): StockMovement[] {
  const movements: StockMovement[] = [];
  const movementRng = createRandom(778899);

  for (const product of seedProducts) {
    const perProduct: Omit<StockMovement, "balanceAfter" | "id">[] = [];

    // Saídas: cada pedido efetivamente separado consumiu estoque.
    for (const order of seedOrders) {
      if (order.status === "cancelado") continue;
      if (STATUS_RANK[order.status] < 2) continue;
      const item = order.items.find((i) => i.productId === product.id);
      if (!item) continue;
      perProduct.push({
        productId: product.id,
        at: order.timeline.find((e) => e.type === "separacao")?.at ?? order.createdAt,
        type: "saida",
        quantity: item.quantity,
        reason: `Separação do pedido #${order.number}`,
        author: SYSTEM,
        orderNumber: order.number,
      });
    }

    // Entradas: a loja repõe o que vendeu. Somar as reposições ao
    // total de saídas mantém o estoque em regime — é isso que faz o
    // histórico aterrissar exatamente no saldo atual do catálogo.
    const totalOut = perProduct.reduce(
      (sum, m) => (m.type === "saida" ? sum + m.quantity : sum),
      0,
    );
    if (totalOut > 0) {
      const restocks = Math.min(3, Math.max(1, Math.round(totalOut / 14)));
      const weights = Array.from({ length: restocks }, () => 0.5 + movementRng());
      const weightSum = weights.reduce((s, w) => s + w, 0);
      let assigned = 0;
      const quantities = weights.map((w, i) => {
        if (i === restocks - 1) return totalOut - assigned;
        const q = Math.max(1, Math.round((totalOut * w) / weightSum));
        assigned += q;
        return q;
      });

      quantities
        .map(
          (quantity) =>
            [quantity, randInt(movementRng, 3, 112)] as [number, number],
        )
        // Mais antigo primeiro: a primeira reposição sustenta o início do período.
        .sort((a, b) => b[1] - a[1])
        .forEach(([quantity, daysAgo]) => {
          if (quantity <= 0) return;
          const at = addDays(NOW, -daysAgo);
          perProduct.push({
            productId: product.id,
            at: new Date(
              `${dayKey(at)}T${String(randInt(movementRng, 9, 17)).padStart(2, "0")}:${String(randInt(movementRng, 0, 59)).padStart(2, "0")}:00-03:00`,
            ).toISOString(),
            type: "entrada",
            quantity,
            reason: pick(movementRng, RESTOCK_REASONS),
            author: pick(movementRng, OPERATORS),
          });
        });
    }

    // Ajustes pontuais: inventário, avaria, devolução. Só fazem
    // sentido em itens que já passaram pela prateleira — rascunhos
    // sem estoque e sem venda não têm histórico nenhum.
    if ((product.stock > 0 || totalOut > 0) && chance(movementRng, 0.35)) {
      const at = addDays(NOW, -randInt(movementRng, 2, 90));
      const delta = weighted(movementRng, [
        [-2, 30], [-1, 34], [1, 20], [2, 16],
      ] as const);
      perProduct.push({
        productId: product.id,
        at: new Date(
          `${dayKey(at)}T${String(randInt(movementRng, 9, 18)).padStart(2, "0")}:20:00-03:00`,
        ).toISOString(),
        type: "ajuste",
        quantity: delta,
        reason: pick(movementRng, ADJUST_REASONS),
        author: pick(movementRng, OPERATORS),
      });
    }

    perProduct.sort((a, b) => a.at.localeCompare(b.at));

    // O saldo inicial é calculado para que o último movimento
    // aterrisse exatamente no estoque atual do catálogo.
    const netChange = () =>
      perProduct.reduce(
        (sum, m) => sum + (m.type === "saida" ? -m.quantity : m.quantity),
        0,
      );
    const lowestBalance = (start: number) => {
      let running = start;
      let lowest = start;
      for (const m of perProduct) {
        running += m.type === "saida" ? -m.quantity : m.quantity;
        lowest = Math.min(lowest, running);
      }
      return lowest;
    };

    let opening = product.stock - netChange();

    // Nenhum saldo pode ficar negativo no meio do caminho. Quando
    // isso acontece, antecipa-se o volume: o déficit sai da última
    // reposição e vai para o saldo inicial. A soma não muda, então
    // o saldo final continua ancorado no catálogo.
    for (let guard = 0; guard < 12; guard += 1) {
      const lowest = lowestBalance(opening);
      if (lowest >= 0) break;
      const deficit = -lowest;
      const donor = [...perProduct]
        .reverse()
        .find((m) => m.type === "entrada" && m.quantity > 1);
      if (!donor) {
        opening += deficit;
        break;
      }
      const take = Math.min(deficit, donor.quantity - 1);
      donor.quantity -= take;
      opening += take;
    }

    let balance = opening;
    perProduct.forEach((movement, index) => {
      balance += movement.type === "saida" ? -movement.quantity : movement.quantity;
      movements.push({
        ...movement,
        id: `mv-${product.id}-${index}`,
        balanceAfter: balance,
      });
    });
  }

  return movements.sort((a, b) => b.at.localeCompare(a.at));
}

export const seedStockMovements: StockMovement[] = buildStockMovements();

/* ———————————————————————— Avaliações ———————————————————————— */

const REVIEW_POOL: { title: string; body: string; rating: number }[] = [
  { rating: 5, title: "Fixação absurda", body: "Passei de manhã e no fim do dia ainda sentia. Recebi elogio no trabalho e até no mercado. Superou a expectativa." },
  { rating: 5, title: "Original e entrega rápida", body: "Comprei desconfiada por ser online, mas veio original, lacrado e com nota. Chegou antes do prazo." },
  { rating: 5, title: "Virou meu assinatura", body: "Doce na medida, sem enjoar. Já é o segundo que compro na JA e o atendimento é impecável." },
  { rating: 4, title: "Muito bom, projeção boa", body: "Cheiro maravilhoso e recebi vários elogios. Tiro uma estrela porque no calor forte a fixação cai um pouco." },
  { rating: 5, title: "Melhor custo-benefício", body: "Pelo preço não existe concorrente. Comprei um para mim e outro de presente no mesmo pedido." },
  { rating: 5, title: "Embalagem impecável", body: "Veio protegido, com papel de seda e um cartão escrito à mão. Dá gosto de receber." },
  { rating: 4, title: "Gostei, mas esperava mais doce", body: "O perfume é ótimo, só achei menos doce do que imaginava pela descrição. Ainda assim uso bastante." },
  { rating: 5, title: "Chegou em dois dias", body: "Pedi na terça e recebi na quinta em Jundiaí. Produto exatamente como descrito." },
  { rating: 5, title: "Presente aprovado", body: "Dei de presente para minha mãe e ela amou. A embalagem de presente ficou linda." },
  { rating: 3, title: "Bom, mas fixação mediana", body: "O cheiro é gostoso e recebi elogios no primeiro momento, mas em umas 4 horas já está fraco na minha pele." },
  { rating: 5, title: "Atendimento nota mil", body: "Tive dúvida no tamanho, chamei no WhatsApp e me responderam na hora. Comprei e não me arrependi." },
  { rating: 5, title: "Igual ao da loja física", body: "Já tinha testado no balcão e o online veio idêntico. Confiança total na JA." },
  { rating: 4, title: "Recomendo", body: "Segunda compra na loja. Chegou certinho e bem embalado. Só o frete que poderia ser mais barato." },
  { rating: 5, title: "Cheiro que dura o dia todo", body: "Borrifo de manhã e sinto até a noite na roupa. Vale cada centavo." },
];

const PENDING_REVIEWS: { title: string; body: string; rating: number }[] = [
  { rating: 5, title: "Amei demais!!!", body: "Gente esse perfume é tudo, sério mesmo. Comprem sem medo que vocês não vão se arrepender de jeito nenhum." },
  { rating: 2, title: "Demorou pra chegar", body: "O perfume é bom mas o pedido demorou mais do que o previsto e ninguém me avisou do atraso." },
  { rating: 5, title: "Perfeito", body: "Chegou rapidinho e bem embalado, exatamente como descrito no site." },
  { rating: 1, title: "Não era o que eu esperava", body: "Achei o cheiro completamente diferente do que imaginava pela descrição do site. Quero saber sobre troca." },
  { rating: 4, title: "Muito bom", body: "Bem melhor do que eu esperava pelo preço. Vou comprar de novo com certeza." },
];

const HIDDEN_REVIEWS: { title: string; body: string; rating: number }[] = [
  { rating: 5, title: "Compre no site X que é mais barato", body: "Achei o mesmo produto por menos em outro lugar, segue o link para quem quiser." },
  { rating: 1, title: "Péssimo", body: "Não gostei." },
];

function buildReviews(): AdminReview[] {
  const reviewRng = createRandom(31337);
  const reviews: AdminReview[] = [];
  const delivered = seedOrders.filter((o) => o.status === "entregue");
  const customerName = new Map(seedCustomerList.map((c) => [c.id, c.name]));
  const customerCity = new Map(
    seedCustomerList.map((c) => [c.id, `${c.addresses[0].city} - ${c.addresses[0].state}`]),
  );
  const used = new Set<string>();

  const push = (
    order: Order,
    template: { title: string; body: string; rating: number },
    status: ReviewStatus,
    offsetDays: number,
  ): boolean => {
    const item = pick(reviewRng, order.items);
    const key = `${order.customerId}:${item.productId}`;
    if (used.has(key)) return false;
    used.add(key);

    const name = customerName.get(order.customerId) ?? "Cliente JA";
    const [first, last] = name.split(" ");
    const createdAt = addDays(
      order.shipping.deliveredAt ?? order.createdAt,
      offsetDays,
    );
    if (createdAt.getTime() > NOW.getTime()) return false;

    reviews.push({
      id: `rv-${order.number}-${item.productId}`,
      productId: item.productId,
      customerId: order.customerId,
      author: `${first} ${last ? `${last[0]}.` : ""}`.trim(),
      city: customerCity.get(order.customerId) ?? "Cabreúva - SP",
      rating: template.rating,
      title: template.title,
      body: template.body,
      createdAt: createdAt.toISOString(),
      status,
      verified: true,
      reply:
        status === "publicada" && chance(reviewRng, 0.3)
          ? {
              body:
                template.rating >= 4
                  ? "Que alegria ler isso! Obrigado pela confiança — a JA agradece e já está te esperando na próxima. 💛"
                  : "Obrigado pelo retorno sincero. Vamos te chamar no WhatsApp para entender melhor e resolver isso.",
              at: addDays(createdAt, randInt(reviewRng, 1, 3)).toISOString(),
              author: "Bruno Henrique",
            }
          : undefined,
    });
    return true;
  };

  /** Consome a fila de textos em cima dos pedidos candidatos. */
  const distribute = (
    candidates: Order[],
    templates: typeof REVIEW_POOL,
    status: ReviewStatus,
    minOffset: number,
    maxOffset: number,
  ) => {
    let index = 0;
    for (const order of candidates) {
      if (index >= templates.length) break;
      if (push(order, templates[index], status, randInt(reviewRng, minOffset, maxOffset)))
        index += 1;
    }
  };

  // Pendentes primeiro: são as mais recentes e as que a moderação vê.
  const recentDelivered = delivered.filter(
    (o) => daysBetween(o.createdAt, NOW) <= 30,
  );
  distribute(recentDelivered, PENDING_REVIEWS, "pendente", 0, 2);

  // Publicadas: espalhadas pelos pedidos entregues mais antigos.
  const olderDelivered = delivered.filter(
    (o) => daysBetween(o.createdAt, NOW) > 8,
  );
  const spread = Array.from({ length: 34 }, (_, i) =>
    olderDelivered[Math.floor((i * olderDelivered.length) / 34)],
  ).filter(Boolean);
  distribute(
    spread,
    Array.from({ length: 34 }, (_, i) => REVIEW_POOL[i % REVIEW_POOL.length]),
    "publicada",
    2,
    9,
  );

  // Ocultas: moderadas por conteúdo impróprio.
  distribute(olderDelivered.slice(3), HIDDEN_REVIEWS, "oculta", 3, 12);

  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const seedReviews: AdminReview[] = buildReviews();

/* ————————————————————————— Cupons ————————————————————————— */

export const seedCoupons: AdminCoupon[] = couponDefs.map((coupon) => ({
  ...coupon,
  // O uso não é digitado: é contado nos pedidos que aplicaram o código.
  used: seedOrders.filter(
    (o) => o.couponCode === coupon.code && o.status !== "cancelado",
  ).length,
}));

/* ———————————————————————— Configurações ———————————————————————— */

export const seedSettings: StoreSettings = {
  storeName: brand.name,
  legalName: "JA Store Comércio de Perfumaria LTDA",
  cnpj: "42.318.907/0001-64",
  email: brand.email,
  phone: brand.phoneDisplay,
  whatsapp: brand.phoneDisplay,
  instagram: `@${brand.instagram}`,
  address: {
    zip: brand.address.zip,
    street: "Rua Fernando Nunes",
    number: "797",
    district: brand.address.district,
    city: brand.address.city,
    state: brand.address.state,
  },
  freeShippingThreshold: brand.shipping.freeThreshold,
  localDeliveryFee: 0,
  standardShippingFee: 24.9,
  expressShippingFee: 34.9,
  pixDiscountPercent: 5,
  maxInstallments: 10,
  minInstallmentValue: 30,
  lowStockAlert: 5,
  seoTitle: `${brand.name} — ${brand.tagline}`,
  seoDescription: brand.descriptionShort,
  emails: {
    orderPlaced: true,
    paymentApproved: true,
    orderShipped: true,
    orderDelivered: true,
    abandonedCart: false,
    reviewRequest: true,
  },
  integrations: [
    { id: "mercadopago", name: "Mercado Pago", description: "Pix, cartão e boleto", connected: true },
    { id: "correios", name: "Correios", description: "Cálculo de frete e rastreio", connected: true },
    { id: "melhorenvio", name: "Melhor Envio", description: "Etiquetas e cotação multi-transportadora", connected: false },
    { id: "whatsapp", name: "WhatsApp Business", description: "Notificações de pedido", connected: true },
    { id: "instagram", name: "Instagram Shopping", description: "Catálogo sincronizado", connected: false },
    { id: "ga4", name: "Google Analytics 4", description: "Comportamento e conversão", connected: true },
  ],
};

/** Sanidade do dataset — usada no dashboard para o rodapé de origem. */
export const seedSummary = {
  orders: seedOrders.length,
  customers: seedCustomerList.length,
  products: seedProducts.length,
  reviews: seedReviews.length,
  movements: seedStockMovements.length,
  from: startOfDay(addDays(NOW, -120)).toISOString(),
  to: NOW.toISOString(),
};
