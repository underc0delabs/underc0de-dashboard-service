/** Solo espacios / invisibles / NFKC, sin quitar tildes (útil antes de LOWER en SQL). */
export function normalizeUserLookupWhitespace(
  raw: string | null | undefined,
): string {
  if (raw == null || typeof raw !== "string") return "";
  let s = raw.normalize("NFKC").trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\p{Zs}+/gu, " ");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Normaliza texto de usuario/nombre para comparar búsqueda (foro, URL) con valor en DB.
 * - NFKC: caracteres de compatibilidad (compat fullwidth, etc.)
 * - Quita zero-width y otros invisibles
 * - Unifica separadores Unicode (Zs) a espacio
 * - NFD + quita marcas combinantes (tildes, umlauts, etc.)
 * - Colapsa espacios y minúsculas locales
 */
export function normalizeUserLookupKey(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return "";
  let s = raw.normalize("NFKC").trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\p{Zs}+/gu, " ");
  s = s.normalize("NFD").replace(/\p{M}/gu, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.toLocaleLowerCase();
}

/** Evita que `%`, `_` o `\` en el texto rompan ILIKE / LIKE. */
export function sanitizeIlikeLiteralFragment(fragment: string): string {
  return fragment.replace(/[%_\\]/g, "");
}
