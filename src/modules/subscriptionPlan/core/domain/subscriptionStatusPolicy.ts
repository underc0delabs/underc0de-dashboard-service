/**
 * Política central de estados de SubscriptionPlan (re-suscripción, webhooks).
 */

export const SUBSCRIPTION_TERMINAL_STATUSES = [
  "CANCELLED",
  "EXPIRED",
  "PAYMENT_FAILED",
] as const;

export type SubscriptionTerminalStatus =
  (typeof SUBSCRIPTION_TERMINAL_STATUSES)[number];

export type SubscriptionPlanStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "PENDING"
  | "EXPIRED"
  | "PAYMENT_FAILED";

export const isTerminalSubscriptionStatus = (
  status: string | null | undefined
): boolean =>
  SUBSCRIPTION_TERMINAL_STATUSES.includes(
    String(status || "").toUpperCase() as SubscriptionTerminalStatus
  );

/** Estado al crear preapproval en MP (respuesta create). */
export const mapMpCreateStatusToModel = (
  mpStatus: string | undefined | null
): SubscriptionPlanStatus => {
  const s = String(mpStatus || "").toLowerCase();
  if (s === "authorized") return "ACTIVE";
  if (s === "pending") return "PENDING";
  return "PENDING";
};

/** Estado al sincronizar preapproval desde MP (webhook / refresh). */
export const mapMpDetailStatusToModel = (
  mpStatus: string | undefined | null
): SubscriptionPlanStatus => {
  const s = String(mpStatus || "").toLowerCase();
  if (s === "authorized") return "ACTIVE";
  if (s === "pending") return "PENDING";
  if (s === "cancelled" || s === "canceled") return "CANCELLED";
  if (s === "paused") return "CANCELLED";
  if (s === "charged_back" || s === "rejected") return "PAYMENT_FAILED";
  return "CANCELLED";
};

/**
 * No promover a ACTIVE una fila ya terminal aunque MP envíe authorized (evento tardío/inconsistente).
 */
export const shouldRejectAuthorizedOnTerminalRow = (
  dbStatus: string | null | undefined,
  mpStatus: string | null | undefined
): boolean => {
  const mp = String(mpStatus || "").toLowerCase();
  if (mp !== "authorized") return false;
  return isTerminalSubscriptionStatus(dbStatus);
};
