import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import {
  isInternalPreapprovalId,
  isMpManagedPreapprovalId,
} from "./subscriptionPlanHelpers.js";

export type MercadoPagoReconcileMatchSource =
  | "stored_authorized"
  | "mp_search_by_identity"
  | "stored_fallback";

export type ResolvedMercadoPagoPreapproval = {
  preapprovalId: string;
  detail: Record<string, unknown>;
  matchSource: MercadoPagoReconcileMatchSource;
};

const normalizeEmail = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const readMpStatus = (detail: Record<string, unknown>): string =>
  String(detail.status ?? "").toLowerCase();

const isAuthorizedDetail = (detail: Record<string, unknown>): boolean =>
  readMpStatus(detail) === "authorized";

const readPayerEmail = (detail: Record<string, unknown>): string => {
  const direct =
    detail.payer_email ??
    detail.payer_email_address ??
    (detail.payer as Record<string, unknown> | undefined)?.email;
  return normalizeEmail(direct);
};

const sortPlansByRecency = (plans: any[]): any[] =>
  [...plans].sort((a, b) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (tb !== ta) {
      return tb - ta;
    }
    return Number(b?.id ?? 0) - Number(a?.id ?? 0);
  });

const collectCandidateIds = (plans: any[]): string[] => {
  const ids = sortPlansByRecency(
    plans.filter(
      (plan) =>
        plan?.mpPreapprovalId && isMpManagedPreapprovalId(plan.mpPreapprovalId)
    )
  ).map((plan) => String(plan.mpPreapprovalId));

  return [...new Set(ids)];
};

const identityMatchesDetail = (
  detail: Record<string, unknown>,
  emails: string[],
  mpPayerId: string | null
): boolean => {
  const payerEmail = readPayerEmail(detail);
  const emailMatch = emails.some((email) => email.length > 0 && payerEmail === email);
  const payerId = String(detail.payer_id ?? "");
  const payerMatch = Boolean(mpPayerId && payerId && payerId === mpPayerId);
  return emailMatch || payerMatch;
};

/**
 * Resuelve qué preapproval de MP reconciliar.
 * Prioriza authorized en filas guardadas; si la guardada está cancelled, busca otra authorized en MP por email/payer.
 */
export const resolveMercadoPagoPreapprovalForReconcile = async (
  mercadoPagoSyncService: MercadoPagoSyncService,
  userJson: Record<string, unknown>,
  plans: any[]
): Promise<ResolvedMercadoPagoPreapproval | null> => {
  const candidateIds = collectCandidateIds(plans);
  const emails = [
    normalizeEmail(userJson.mercadopago_email),
    normalizeEmail(userJson.email),
  ].filter(Boolean);
  const mpPayerId =
    userJson.mpPayerId != null && String(userJson.mpPayerId).trim() !== ""
      ? String(userJson.mpPayerId).trim()
      : null;

  for (const preapprovalId of candidateIds) {
    const detail = (await mercadoPagoSyncService.getPreapprovalById(
      preapprovalId
    )) as Record<string, unknown> | null;
    if (detail && isAuthorizedDetail(detail)) {
      return {
        preapprovalId,
        detail,
        matchSource: "stored_authorized",
      };
    }
  }

  const mpSubscriptions = await mercadoPagoSyncService.syncSubscriptions();
  const authorizedSubs = mpSubscriptions.filter(
    (sub) => String(sub.status ?? "").toLowerCase() === "authorized"
  );

  for (const sub of authorizedSubs) {
    const preapprovalId = String(sub.id);
    if (candidateIds.includes(preapprovalId)) {
      continue;
    }

    const detail = (await mercadoPagoSyncService.getPreapprovalById(
      preapprovalId
    )) as Record<string, unknown> | null;
    if (!detail || !isAuthorizedDetail(detail)) {
      continue;
    }
    if (!identityMatchesDetail(detail, emails, mpPayerId)) {
      continue;
    }

    return {
      preapprovalId,
      detail,
      matchSource: "mp_search_by_identity",
    };
  }

  if (candidateIds.length > 0) {
    const preapprovalId = candidateIds[0];
    const detail = (await mercadoPagoSyncService.getPreapprovalById(
      preapprovalId
    )) as Record<string, unknown> | null;
    if (detail) {
      return {
        preapprovalId,
        detail,
        matchSource: "stored_fallback",
      };
    }
  }

  return null;
};
