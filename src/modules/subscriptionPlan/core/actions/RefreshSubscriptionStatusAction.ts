import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { ISyncSubscriptionByPreapprovalIdAction } from "./SyncSubscriptionByPreapprovalIdAction.js";

export interface IRefreshSubscriptionStatusAction {
  execute: (params: {
    userId: string;
    preapproval_id?: string;
  }) => Promise<{
    success: boolean;
    subscription_status?: string;
    user_is_pro?: boolean;
    message?: string;
  }>;
}

const planBelongsToUser = (
  plan: { userId?: number | string | null },
  userId: string
): boolean => {
  if (plan.userId == null) return true;
  return String(plan.userId) === String(userId);
};

export const RefreshSubscriptionStatusAction = (
  userRepository: IUserRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  syncSubscriptionByPreapprovalId: ISyncSubscriptionByPreapprovalIdAction
): IRefreshSubscriptionStatusAction => {
  return {
    execute: async ({ userId, preapproval_id }) => {
      if (preapproval_id?.trim()) {
        const preapprovalId = preapproval_id.trim();
        const subscription = await subscriptionPlanRepository.getOne({
          mpPreapprovalId: preapprovalId,
        });
        if (subscription) {
          const subJson =
            (subscription as any).toJSON?.() ?? subscription;
          if (!planBelongsToUser(subJson, userId)) {
            return {
              success: false,
              message: "No autorizado para sincronizar esa suscripción",
            };
          }
        }
        return syncSubscriptionByPreapprovalId.execute(preapprovalId);
      }

      const result = await subscriptionPlanRepository.get({
        userId,
        page_count: 1,
        page_number: 0,
      });
      const plans = result?.subscriptionPlans ?? [];
      const mostRecent = Array.isArray(plans) ? plans[0] : null;

      if (!mostRecent?.mpPreapprovalId) {
        return {
          success: false,
          message: "No subscription found for user",
        };
      }

      return syncSubscriptionByPreapprovalId.execute(
        String(mostRecent.mpPreapprovalId)
      );
    },
  };
};
