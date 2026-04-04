/** Estados por dimensión — v1 admin provisioning (alineado a design openspec). */

export const FORUM_STATUS = {
  NOT_LINKED: "not_linked",
  PENDING_VALIDATION: "pending_validation",
  LINKED: "linked",
  ERROR: "error",
} as const;

export const MERCADOPAGO_STATUS = {
  NOT_CONFIGURED: "not_configured",
  PENDING: "pending",
  LINKED: "linked",
  ERROR: "error",
} as const;

export const SUBSCRIPTION_STATUS = {
  NONE: "none",
  PENDING_CHECKOUT: "pending_checkout",
  TRIAL: "trial",
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type ForumStatus = (typeof FORUM_STATUS)[keyof typeof FORUM_STATUS];
export type MercadopagoStatus =
  (typeof MERCADOPAGO_STATUS)[keyof typeof MERCADOPAGO_STATUS];
export type MemberSubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
