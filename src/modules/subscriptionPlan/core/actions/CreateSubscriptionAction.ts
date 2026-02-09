import axios from "axios";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js";

const OWNER_PREAPPROVAL_PREFIX = "owner-";

const grantOwnerSubscription = async (
  user: any,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userRepository: IUserRepository
) => {
  const ownerPreapprovalId = `${OWNER_PREAPPROVAL_PREFIX}${user.id}`;
  const existing = await subscriptionPlanRepository.getOne({
    mpPreapprovalId: ownerPreapprovalId,
  });
  if (existing) {
    await subscriptionPlanRepository.edit(
      { ...existing, status: "ACTIVE" } as any,
      existing.id.toString()
    );
  } else {
    await subscriptionPlanRepository.save({
      userId: user.id,
      status: "ACTIVE",
      startedAt: new Date(),
      mpPreapprovalId: ownerPreapprovalId,
      mpSubscriptionId: ownerPreapprovalId,
    } as any);
  }
  await userRepository.edit(
    { ...user, is_pro: true } as any,
    user.id.toString()
  );
  return { status: "ACTIVE", init_point: null, is_owner: true };
};

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
        const user = await userRepository.getOne({ email: userData.email });
        if (!user) throw new Error("Usuario no encontrado");

        const collectorEmail = process.env.MERCADO_PAGO_COLLECTOR_EMAIL?.trim().toLowerCase();
        const isCollector = collectorEmail && userData.email?.trim().toLowerCase() === collectorEmail;

        if (isCollector) {
          return grantOwnerSubscription(user, subscriptionPlanRepository, userRepository);
        }

        const transactionAmount = await environmentRepository.getByKey("MERCADO_PAGO_PRICE") || process.env.MERCADO_PAGO_PRICE;
        const response = await mercadoPagoGateway.createPreapproval(userData.email, Number(transactionAmount));
        const { id, init_point, status } = response;
        await subscriptionPlanRepository.save({
          userId: user.id,
          status: status,
          startedAt: new Date(),
          expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
          mpPreapprovalId: id,
          mpSubscriptionId: id,
        } as any);
        return {
          init_point,
          preapproval_id: id,
          status,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const msg = String(error.response?.data?.message ?? error.response?.data?.error ?? error.message);
          if (/payer and collector cannot be the same/i.test(msg)) {
            const user = await userRepository.getOne({ email: userData.email });
            if (user) {
              return grantOwnerSubscription(user, subscriptionPlanRepository, userRepository);
            }
          }
          throw new Error(`Error al crear suscripción en MercadoPago: ${msg}`);
        }
        throw error;
      }
    },
  };
};
