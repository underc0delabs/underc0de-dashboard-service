import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import {
  isTerminalSubscriptionStatus,
  mapMpDetailStatusToModel,
  type SubscriptionPlanStatus,
} from "../domain/subscriptionStatusPolicy.js";
import {
  calculateNextPaymentDateFromMpDetail,
  isInternalPreapprovalId,
} from "../domain/subscriptionPlanHelpers.js";
import {
  resolveIsProAfterMpSync,
} from "../../../users/core/domain/userVipPolicy.js";

const logWebhook = (msg: string, extra?: Record<string, unknown>) => {
  console.warn(`[SubscriptionWebhook] ${msg}`, extra ? JSON.stringify(extra) : "");
};

const demoteOtherActiveSubscriptions = async (
  userId: number,
  exceptSubscriptionId: string | number,
  subscriptionPlanRepository: ISubscriptionPlanRepository
) => {
  const result = await subscriptionPlanRepository.get({
    userId,
    status: "ACTIVE",
    page_count: 200,
    page_number: 0,
  });
  const plans = result?.subscriptionPlans ?? [];
  for (const row of plans) {
    const id = (row as any).id ?? (row as any).dataValues?.id;
    const plan = (row as any).toJSON?.() ?? row;
    if (isInternalPreapprovalId(plan.mpPreapprovalId)) continue;
    if (String(plan.provider ?? "").toLowerCase() === "apple") continue;
    if (id == null || String(id) === String(exceptSubscriptionId)) continue;
    await subscriptionPlanRepository.edit({ status: "CANCELLED" } as any, String(id));
  }
};

export interface ISyncSubscriptionByPreapprovalIdAction {
  execute: (preapprovalId: string) => Promise<{
    success: boolean;
    subscription_status?: string;
    user_is_pro?: boolean;
    message?: string;
  }>;
}

export const SyncSubscriptionByPreapprovalIdAction = (
  userRepository: IUserRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  mercadoPagoGateway: MercadoPagoGateway
): ISyncSubscriptionByPreapprovalIdAction => {
  return {
    execute: async (preapprovalId: string) => {
      const detail = await mercadoPagoGateway.getPreapprovalById(preapprovalId);
      if (!detail) {
        return { success: false, message: "Preapproval not found in MercadoPago" };
      }

      const mpStatusRaw = detail.status;
      const subscription = await subscriptionPlanRepository.getOne({
        mpPreapprovalId: preapprovalId,
      });

      if (!subscription) {
        return { success: false, message: "Subscription not found" };
      }

      const subJson =
        (subscription as any).toJSON?.() ?? subscription;
      const currentStatus = String(subJson.status ?? "");
      const mappedStatus: SubscriptionPlanStatus =
        mapMpDetailStatusToModel(mpStatusRaw);

      // MP es la fuente de verdad (detalle consultado en vivo): un authorized
      // reactiva filas CANCELLED/PAYMENT_FAILED (p. ej. tras pausa o checkout reemplazado).

      if (currentStatus === mappedStatus) {
        const userId = subJson.userId;
        if (userId) {
          const user = await userRepository.getById(String(userId));
          const plans = (user as any)?.subscriptionPlans ?? [];
          const expectPro = resolveIsProAfterMpSync(
            mappedStatus === "ACTIVE",
            plans
          );
          if (
            user &&
            Boolean((user as any).is_pro) === expectPro
          ) {
            return {
              success: true,
              subscription_status: mappedStatus,
              user_is_pro: expectPro,
              message: "idempotent",
            };
          }
        } else {
          return {
            success: true,
            subscription_status: mappedStatus,
            message: "idempotent",
          };
        }
      }

      if (subJson.userId) {
        if (mappedStatus === "ACTIVE" || isTerminalSubscriptionStatus(mappedStatus)) {
          await demoteOtherActiveSubscriptions(
            Number(subJson.userId),
            subJson.id,
            subscriptionPlanRepository
          );
        }
      }

      const nextPaymentDate = calculateNextPaymentDateFromMpDetail(detail);

      await subscriptionPlanRepository.edit(
        {
          ...subJson,
          status: mappedStatus,
          ...(nextPaymentDate ? { nextPaymentDate } : {}),
        } as any,
        String(subJson.id)
      );

      if (subJson.userId) {
        const user = await userRepository.getById(String(subJson.userId));
        if (user) {
          const plans = (user as any)?.subscriptionPlans ?? [];
          const isPro = resolveIsProAfterMpSync(
            mappedStatus === "ACTIVE",
            plans
          );
          await userRepository.edit(
            {
              ...user,
              is_pro: isPro,
            } as any,
            user.id.toString()
          );

          return {
            success: true,
            subscription_status: mappedStatus,
            user_is_pro: isPro,
          };
        }
      }

      return {
        success: true,
        subscription_status: mappedStatus,
        user_is_pro: mappedStatus === "ACTIVE",
      };
    },
  };
};
