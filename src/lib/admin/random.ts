/**
 * Gerador pseudoaleatório determinístico (mulberry32).
 *
 * Toda a base simulada do painel nasce daqui. Como a semente é
 * fixa, a mesma sequência sai no servidor e no cliente, em toda
 * build e em todo recarregamento — nada "muda sozinho" entre um
 * render e outro, e não existe divergência de hidratação.
 */
export type Random = () => number;

export function createRandom(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inteiro em [min, max]. */
export const randInt = (rng: Random, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

/** Item aleatório de uma lista não vazia. */
export const pick = <T,>(rng: Random, list: readonly T[]): T =>
  list[Math.floor(rng() * list.length)];

/** Sorteio com pesos: [[valor, peso], …]. */
export const weighted = <T,>(
  rng: Random,
  entries: readonly (readonly [T, number])[],
): T => {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
};

/** Verdadeiro com probabilidade `chance` (0–1). */
export const chance = (rng: Random, probability: number) =>
  rng() < probability;

/** Embaralhamento Fisher–Yates determinístico (não muta a origem). */
export const shuffle = <T,>(rng: Random, list: readonly T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Arredonda para centavos — dinheiro nunca carrega dízima. */
export const round2 = (value: number) => Math.round(value * 100) / 100;
