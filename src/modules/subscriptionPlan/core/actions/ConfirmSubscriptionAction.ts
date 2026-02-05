import axios from "axios";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";

export interface IConfirmSubscriptionAction {
  execute: (webhookBody: any) => Promise<any>;
}

export const ConfirmSubscriptionAction = (
  userRepository: IUserRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): IConfirmSubscriptionAction => {
  return {
    execute: async (webhookBody: any) => {
      try {
        if (webhookBody.type !== "preapproval") {
          return { success: true, message: "Event type not handled" };
        }

        const preapprovalId = webhookBody.data?.id;
        if (!preapprovalId) {
          return { success: false, message: "Missing preapproval ID" };
        }

        const mpResponse = await axios.get(
          `https://api.mercadopago.com/preapproval/${preapprovalId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
          }
        );
        const { status, payer_email } = mpResponse.data;
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
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Error al consultar MercadoPago: ${
              error.response?.data?.message || error.message
            }`
          );
        }
        throw error;
      }
    },
  };
};
