import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET?.trim();

/**
 * Valida opcionalmente la firma x-signature del webhook de MercadoPago.
 * Si MP_WEBHOOK_SECRET no está configurado, deja pasar la request (backward compatible).
 * Template según doc MP: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
export const validateMercadoPagoWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!WEBHOOK_SECRET) {
    return next();
  }

  const xSignature = req.headers["x-signature"] as string | undefined;
  const xRequestId = req.headers["x-request-id"] as string | undefined;

  if (!xSignature) {
    console.warn("[webhook/mercadopago] MP_WEBHOOK_SECRET set but x-signature missing - allowing (subscriptions may not send it)");
    return next();
  }

  const parts = xSignature.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [key, val] = part.split("=");
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    },
    {}
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    console.warn("[webhook/mercadopago] Invalid x-signature format");
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  const dataId =
    req.body?.data?.id ?? req.body?.id ?? req.query?.["data.id"];
  const idStr = dataId != null ? String(dataId).toLowerCase() : "";

  const manifest = `id:${idStr};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  if (expectedHash !== v1) {
    console.warn("[webhook/mercadopago] Signature mismatch");
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  const tsNum = parseInt(ts, 10);
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 300;
  if (Math.abs(now - tsNum) > maxAge) {
    console.warn("[webhook/mercadopago] Signature too old");
    res.status(401).json({ error: "Webhook timestamp expired" });
    return;
  }

  next();
};
