export type PartnerAuthResult =
  | { ok: true; clientId: string }
  | { ok: false; reason: string };

/**
 * Tabla cliente → secreto desde `process.env.L2_PARTNER_API_KEYS` (JSON object).
 */
export function parsePartnerApiKeyTableFromEnv(
  raw: string | undefined
): Record<string, string> | null {
  if (!raw?.trim()) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== "object" || o === null || Array.isArray(o)) return null;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      const cid = k.trim();
      const key =
        typeof v === "string" ? v.trim() : String(v ?? "").trim();
      if (!cid || !key) continue;
      out[cid] = key;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene la clave enviada por el cliente vía Bearer o cabecera legacy.
 */
export const extractIncomingPartnerCredential = (req: {
  header(name: string): string | undefined;
}): string | null => {
  const raw = req.header("authorization")?.trim();
  if (raw) {
    const m = raw.match(/^Bearer\s+(.+)$/i);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  const dash = req.header("x-partner-integration-key")?.trim();
  return dash || null;
};

/**
 * Resuelve autent partner: modo multi-cliente (L2_PARTNER_API_KEYS) o modo legacy (un solo secreto).
 */
export const resolvePartnerIntegrationAuth = (params: {
  partnerApiKeysJson: Record<string, string> | null;
  legacySecret: string | null;
  clientIdHeader: string | undefined;
  incomingKey: string | null;
}): PartnerAuthResult => {
  const { partnerApiKeysJson, legacySecret, clientIdHeader, incomingKey } =
    params;

  if (!incomingKey) {
    return { ok: false, reason: "missing_credential" };
  }

  if (partnerApiKeysJson && Object.keys(partnerApiKeysJson).length > 0) {
    const clientId = clientIdHeader?.trim();
    if (!clientId) {
      return { ok: false, reason: "missing_client_id" };
    }
    const expected = partnerApiKeysJson[clientId];
    if (!expected || expected !== incomingKey) {
      return { ok: false, reason: "invalid_key_or_client" };
    }
    return { ok: true, clientId };
  }

  if (legacySecret && incomingKey === legacySecret) {
    return { ok: true, clientId: "legacy" };
  }

  return { ok: false, reason: "invalid_or_unconfigured_key" };
};
