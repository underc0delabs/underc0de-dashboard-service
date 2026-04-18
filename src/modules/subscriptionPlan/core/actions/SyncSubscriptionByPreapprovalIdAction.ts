import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import {
  mapMpDetailStatusToModel,
  shouldRejectAuthorizedOnTerminalRow,
  type SubscriptionPlanStatus,
} from "../domain/subscriptionStatusPolicy.js";

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

      if (
        shouldRejectAuthorizedOnTerminalRow(currentStatus, mpStatusRaw)
      ) {
        logWebhook("ignored_authorized_on_terminal_row", {
          preapprovalId,
          dbStatus: currentStatus,
          mpStatus: mpStatusRaw,
        });
        return {
          success: true,
          message: "ignored_authorized_on_terminal_subscription",
          subscription_status: currentStatus,
          user_is_pro: false,
        };
      }

      if (currentStatus === mappedStatus) {
        const userId = subJson.userId;
        if (userId) {
          const user = await userRepository.getById(String(userId));
          const expectPro = mappedStatus === "ACTIVE";
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

      if (mappedStatus === "ACTIVE" && subJson.userId) {
        await demoteOtherActiveSubscriptions(
          Number(subJson.userId),
          subJson.id,
          subscriptionPlanRepository
        );
      }

      await subscriptionPlanRepository.edit(
        {
          ...subJson,
          status: mappedStatus,
        } as any,
        String(subJson.id)
      );

      if (subJson.userId) {
        const user = await userRepository.getById(String(subJson.userId));
        if (user) {
          const isPro = mappedStatus === "ACTIVE";
          await userRepository.edit(
            {
              ...user,
              is_pro: isPro,
            } as any,
            user.id.toString()
          );
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
