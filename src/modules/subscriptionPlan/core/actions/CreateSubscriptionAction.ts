import axios from "axios";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js";

export interface ICreateSubscriptionAction {
  execute: (user: {email: string}) => Promise<any>;
}

export const CreateSubscriptionAction = (
  mercadoPagoGateway: MercadoPagoGateway,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userRepository: IUserRepository,
  environmentRepository: IEnvironmentRepository
): ICreateSubscriptionAction => {
  return {
    execute: async (userData: {email: string}) => {
      try {
        const user = await userRepository.getOne({ email: userData.email })
        const transactionAmount = await environmentRepository.getByKey("MERCADO_PAGO_PRICE") || process.env.MERCADO_PAGO_PRICE
        const response = await mercadoPagoGateway.createPreapproval(userData.email, Number(transactionAmount))
        const { id, init_point, status } = response;
        await subscriptionPlanRepository.save({
          userId: user.id,
          status: status,
          startedAt: new Date(),
          expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
          mpPreapprovalId: id,
          mpSubscriptionId: id,
        });
        return {
          init_point,
          preapproval_id: id,
          status,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Error al crear suscripción en MercadoPago: ${
              error.response?.data?.message || error.message
            }`
          );
        }
        throw error;
      }
    },
  };
};
