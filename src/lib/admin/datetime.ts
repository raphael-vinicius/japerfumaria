/**
 * Datas do painel — sempre no fuso da loja.
 *
 * Duas regras que sustentam a consistência do protótipo:
 *
 * 1. Todo formatador fixa `timeZone`, então servidor e cliente
 *    produzem exatamente a mesma string (zero erro de hidratação).
 * 2. O "agora" da aplicação é a constante `NOW`, não `Date.now()`.
 *    Os dados simulados são gerados a partir dela, então "hoje"
 *    no dashboard sempre bate com os pedidos de hoje na tabela.
 *    Com backend real, basta trocar `NOW` por `new Date()`.
 */

export const TZ = "America/Sao_Paulo";

/** Referência temporal da aplicação (23/07/2026, 17h05, horário de Brasília). */
export const NOW = new Date("2026-07-23T17:05:00-03:00");

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, ...opts });

const dateFmt = fmt({ day: "2-digit", month: "2-digit", year: "numeric" });
const shortFmt = fmt({ day: "2-digit", month: "short" });
const longFmt = fmt({ day: "2-digit", month: "long", year: "numeric" });
const timeFmt = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
const monthFmt = fmt({ month: "short" });
const monthYearFmt = fmt({ month: "long", year: "numeric" });
const weekdayFmt = fmt({ weekday: "short" });
/** en-CA devolve YYYY-MM-DD — chave de dia estável e ordenável. */
const keyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const toDate = (value: string | Date): Date =>
  typeof value === "string" ? new Date(value) : value;

/** 23/07/2026 */
export const formatDate = (v: string | Date) => dateFmt.format(toDate(v));

/** 23 jul — pt-BR devolve "23 de jul.", removemos o "de" e o ponto. */
export const formatDateShort = (v: string | Date) =>
  shortFmt.format(toDate(v)).replace(" de ", " ").replace(".", "");

/** 23 de julho de 2026 */
export const formatDateLong = (v: string | Date) => longFmt.format(toDate(v));

/** 14:32 */
export const formatTime = (v: string | Date) => timeFmt.format(toDate(v));

/** 23/07/2026 às 14:32 */
export const formatDateTime = (v: string | Date) =>
  `${formatDate(v)} às ${formatTime(v)}`;

/** jul */
export const formatMonth = (v: string | Date) =>
  monthFmt.format(toDate(v)).replace(".", "");

/** julho de 2026 */
export const formatMonthYear = (v: string | Date) =>
  monthYearFmt.format(toDate(v));

/** seg */
export const formatWeekday = (v: string | Date) =>
  weekdayFmt.format(toDate(v)).replace(".", "");

/** Chave de dia no fuso da loja: "2026-07-23". */
export const dayKey = (v: string | Date) => keyFmt.format(toDate(v));

export const MS_DAY = 86_400_000;

export const addDays = (v: string | Date, days: number) =>
  new Date(toDate(v).getTime() + days * MS_DAY);

export const isSameDay = (a: string | Date, b: string | Date) =>
  dayKey(a) === dayKey(b);

/** Dias inteiros entre dois instantes, pelo dia civil da loja. */
export const daysBetween = (a: string | Date, b: string | Date) => {
  const [ay, am, ad] = dayKey(a).split("-").map(Number);
  const [by, bm, bd] = dayKey(b).split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / MS_DAY,
  );
};

/** "agora", "há 12 min", "há 3 h", "ontem", "há 4 dias", "12 mar". */
export const formatRelative = (v: string | Date, from: Date = NOW) => {
  const date = toDate(v);
  const diffMs = from.getTime() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const days = daysBetween(date, from);
  if (days === 0) {
    const hours = Math.max(1, Math.round(diffMs / 3_600_000));
    return `há ${hours} h`;
  }
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
  }
  return formatDateShort(date);
};

/** Rótulo humano de um dia: "Hoje", "Ontem" ou "23 jul". */
export const formatDayLabel = (v: string | Date, from: Date = NOW) => {
  const days = daysBetween(v, from);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return formatDateShort(v);
};

/** Meia-noite do dia informado, no fuso da loja. */
export const startOfDay = (v: string | Date) =>
  new Date(`${dayKey(v)}T00:00:00-03:00`);

/** Último instante do dia informado, no fuso da loja. */
export const endOfDay = (v: string | Date) =>
  new Date(`${dayKey(v)}T23:59:59.999-03:00`);

export const startOfMonth = (v: string | Date) => {
  const [y, m] = dayKey(v).split("-");
  return new Date(`${y}-${m}-01T00:00:00-03:00`);
};

/** Prazo de entrega em dias úteis, contado a partir do envio. */
export const addBusinessDays = (v: string | Date, days: number) => {
  const date = toDate(v);
  let remaining = days;
  let cursor = date;
  while (remaining > 0) {
    cursor = addDays(cursor, 1);
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return cursor;
};
