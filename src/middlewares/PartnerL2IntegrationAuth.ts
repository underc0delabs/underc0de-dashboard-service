import { NextFunction, Request, Response } from "express";

import configs from "../configs.js";
import {
  extractIncomingPartnerCredential,
  resolvePartnerIntegrationAuth,
} from "../helpers/partnerIntegrationAuth.js";

/**
 * Backend solo (l2memories, etc.).
 * - Modo proyectos: JSON en L2_PARTNER_API_KEYS + Bearer + X-Partner-Client-Id
 * - Modo único secreto legacy: L2_PARTNER_INTEGRATION_SECRET (+ x-partner-integration-key o Bearer)
 */
export const partnerL2IntegrationAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!configs.l2_partner_integration_enabled) {
    return res.status(503).json({
      status: 503,
      success: false,
      msg: "Integración L2 deshabilitada (L2_PARTNER_INTEGRATION_ENABLED=false)",
      result: null,
      pagination: null,
    });
  }

  const hasTable =
    configs.partner_api_keys_json &&
    Object.keys(configs.partner_api_keys_json).length > 0;
  const hasLegacy = Boolean(configs.l2_partner_integration_secret);

  if (!hasTable && !hasLegacy) {
    return res.status(503).json({
      status: 503,
      success: false,
      msg:
        "Integración sin credenciales: definí L2_PARTNER_API_KEYS o L2_PARTNER_INTEGRATION_SECRET",
      result: null,
      pagination: null,
    });
  }

  const incoming = extractIncomingPartnerCredential(req);

  const result = resolvePartnerIntegrationAuth({
    partnerApiKeysJson: hasTable ? configs.partner_api_keys_json : null,
    legacySecret: configs.l2_partner_integration_secret ?? null,
    clientIdHeader: req.header("x-partner-client-id"),
    incomingKey: incoming,
  });

  if (!result.ok) {
    let msg =
      "Autenticación de integración inválida";
    if (result.reason === "missing_client_id") {
      msg =
        "Cuando usás API keys por proyecto, enviá el header X-Partner-Client-Id (ej. l2memories)";
    } else if (result.reason === "missing_credential") {
      msg =
        "Enviá Authorization: Bearer <api_key> o x-partner-integration-key";
    }
    return res.status(401).json({
      status: 401,
      success: false,
      msg,
      result: null,
      pagination: null,
    });
  }

  (req as any).partnerClientId = result.clientId;
  next();
};
