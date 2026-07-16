import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { ISyncSubscriptionByPreapprovalIdAction } from "./SyncSubscriptionByPreapprovalIdAction.js";
import { resolveIsProAfterMpSync } from "../../../users/core/domain/userVipPolicy.js";

const toRow = (p: any) => (p?.toJSON ? p.toJSON() : p);

/**
 * Misma idea que en users (MongoUserRepository): entre varios ACTIVE, el más reciente.
 * Excluye planes `owner-*` (no cancelables vía MP desde la app).
 */
const pickLatestMercadoPagoActivePlan = (plans: any[] | undefined): any | null => {
  if (!plans?.length) return null;
  const actives = plans
    .map(toRow)
    .filter(
      (p: any) =>
        p?.status === "ACTIVE" &&
        p?.mpPreapprovalId &&
        !String(p.mpPreapprovalId).startsWith("owner-")
    );
  if (actives.length === 0) return null;
  return actives.reduce((best: any, p: any) => {
    const bt = best?.createdAt ? new Date(best.createdAt).getTime() : 0;
    const pt = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
    if (pt > bt) return p;
    if (pt === bt && Number(p?.id) > Number(best?.id)) return p;
    return best;
  });
};

export class NoActiveSubscriptionToCancelError extends Error {
  constructor() {
    super(
      "No tenés una suscripción activa de Mercado Pago para cancelar."
    );
    this.name = "NoActiveSubscriptionToCancelError";
  }
}

export interface ICancelSubscriptionAction {
  execute: (userId: string) => Promise<{
    success: boolean;
    subscription_status?: string;
    user_is_pro?: boolean;
    message?: string;
  }>;
}

export const CancelSubscriptionAction = (
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  mercadoPagoGateway: MercadoPagoGateway,
  syncSubscriptionByPreapprovalId: ISyncSubscriptionByPreapprovalIdAction,
  userRepository: IUserRepository
): ICancelSubscriptionAction => ({
  execute: async (userId: string) => {
    const result = await subscriptionPlanRepository.get({
      userId,
      page_count: 100,
      page_number: 0,
    });
    const plans = result?.subscriptionPlans ?? [];
    const plan = pickLatestMercadoPagoActivePlan(plans);
    if (!plan?.mpPreapprovalId) {
      throw new NoActiveSubscriptionToCancelError();
    }

    const preapprovalId = String(plan.mpPreapprovalId);
    const detail = await mercadoPagoGateway.getPreapprovalById(preapprovalId);
    if (!detail) {
      const err = new Error("Preapproval no encontrado en Mercado Pago");
      (err as any).name = "MercadoPagoPreapprovalNotFoundError";
      throw err;
    }

    const st = String((detail as any).status ?? "").toLowerCase();
    if (st === "authorized" || st === "pending") {
      await mercadoPagoGateway.cancelPreapproval(preapprovalId);
    }

    const syncResult = await syncSubscriptionByPreapprovalId.execute(
      preapprovalId
    );
    if (!syncResult.success) {
      await subscriptionPlanRepository.edit(
        { status: "CANCELLED" } as any,
        String(plan.id)
      );
      const user = await userRepository.getById(userId);
      const remainingPlans = (user as any)?.subscriptionPlans ?? plans;
      const isPro = resolveIsProAfterMpSync(false, remainingPlans);
      await userRepository.edit({ is_pro: isPro } as any, userId);
      console.warn("[CancelSubscription] Sync failed after MP cancel; local state demoted", {
        userId,
        preapprovalId,
        syncMessage: syncResult.message,
      });
      return {
        success: true,
        subscription_status: "CANCELLED",
        user_is_pro: isPro,
        message: "cancelled_locally_after_mp",
      };
    }

    return syncResult;
  },
});
