/**
 * Exportação de listas para CSV.
 *
 * Formato pensado para o Excel em português: separador ponto-e-
 * vírgula, BOM UTF-8 (senão os acentos quebram) e decimal com
 * vírgula. Exporta exatamente o que está filtrado na tela — o que
 * o operador vê é o que sai no arquivo.
 */

const escapeCell = (value: unknown): string => {
  if (value == null) return "";
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Número no padrão pt-BR, pronto para colar na planilha. */
export const csvNumber = (value: number, decimals = 2): string =>
  value.toFixed(decimals).replace(".", ",");

export function toCsv(
  columns: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const lines = [columns.map(escapeCell).join(";")];
  for (const row of rows) lines.push(row.map(escapeCell).join(";"));
  return lines.join("\r\n");
}

export function downloadCsv(
  filename: string,
  columns: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const csv = toCsv(columns, rows);
  // ﻿: sem o BOM, o Excel abre o arquivo em Latin-1.
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Copia texto para a área de transferência, com retorno de sucesso. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
