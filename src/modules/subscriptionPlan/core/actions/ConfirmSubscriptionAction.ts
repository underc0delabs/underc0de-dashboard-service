import { ISyncSubscriptionByPreapprovalIdAction } from "./SyncSubscriptionByPreapprovalIdAction.js";

const PREAPPROVAL_TYPES = [
  "preapproval",
  "subscription_preapproval",
  "subscription",
] as const;

/**
 * Extrae el preapproval_id del body del webhook de MercadoPago.
 * MP puede enviar distintos formatos según la versión de la API.
 */
const extractPreapprovalId = (body: any): string | null => {
  if (!body || typeof body !== "object") return null;
  const id =
    body.data?.id ??
    body.id ??
    body.data?.preapproval_id ??
    body.preapproval_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
};

export interface IConfirmSubscriptionAction {
  execute: (webhookBody: any) => Promise<any>;
}

export const ConfirmSubscriptionAction = (
  syncSubscriptionByPreapprovalId: ISyncSubscriptionByPreapprovalIdAction
): IConfirmSubscriptionAction => {
  return {
    execute: async (webhookBody: any) => {
      const type = String(webhookBody?.type ?? "").toLowerCase();
      const isPreapprovalEvent = PREAPPROVAL_TYPES.some((t) =>
        type.includes(t)
      );

      if (!isPreapprovalEvent) {
        return { success: true, message: "Event type not handled" };
      }

      const preapprovalId = extractPreapprovalId(webhookBody);
      if (!preapprovalId) {
        return { success: false, message: "Missing preapproval ID" };
      }

      return syncSubscriptionByPreapprovalId.execute(preapprovalId);
    },
  };
};
