import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";

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

      const status = detail.status;
      const subscription = await subscriptionPlanRepository.getOne({
        mpPreapprovalId: preapprovalId,
      });

      if (!subscription) {
        return { success: false, message: "Subscription not found" };
      }

      const newStatus = status === "authorized" ? "ACTIVE" : "CANCELLED";
      await subscriptionPlanRepository.edit(
        {
          ...subscription,
          status: newStatus,
        } as any,
        subscription.id.toString()
      );

      if (subscription.userId) {
        const user = await userRepository.getById(subscription.userId.toString());
        if (user) {
          const isPro = status === "authorized";
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
        subscription_status: newStatus,
        user_is_pro: status === "authorized",
      };
    },
  };
};
