import axios from "axios";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js";

const OWNER_PREAPPROVAL_PREFIX = "owner-";

/**
 * Maps MercadoPago status to SubscriptionPlan ENUM (ACTIVE | CANCELLED).
 * MP returns "authorized" when paid, "pending" when awaiting payment. Pending maps to CANCELLED
 * until webhook/sync updates to ACTIVE after payment.
 */
const mapMpStatusToModel = (mpStatus: string): "ACTIVE" | "CANCELLED" => {
  if (String(mpStatus || "").toLowerCase() === "authorized") return "ACTIVE";
  return "CANCELLED";
};

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
  execute: (userData: { userId: string }) => Promise<any>;
}

export const CreateSubscriptionAction = (
  mercadoPagoGateway: MercadoPagoGateway,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userRepository: IUserRepository,
  environmentRepository: IEnvironmentRepository
): ICreateSubscriptionAction => {
  return {
    execute: async (userData: { userId: string }) => {
      try {
        const user = await userRepository.getById(userData.userId);
        if (!user) throw new Error("Usuario no encontrado");

        const userEmail = (user as any).email?.trim?.();
        if (!userEmail) throw new Error("El usuario no tiene email asociado");

        const collectorEmail = process.env.MERCADO_PAGO_COLLECTOR_EMAIL?.trim().toLowerCase();
        const mpEmail = (user as any).mercadopago_email?.trim?.() || userEmail;
        const isCollector =
          collectorEmail &&
          (userEmail.toLowerCase() === collectorEmail ||
            (user as any).mercadopago_email?.trim?.().toLowerCase() === collectorEmail);

        if (isCollector) {
          return grantOwnerSubscription(user, subscriptionPlanRepository, userRepository);
        }

        const transactionAmountRaw = await environmentRepository.getByKey("MERCADO_PAGO_PRICE") || process.env.MERCADO_PAGO_PRICE;
        if (transactionAmountRaw === undefined || transactionAmountRaw === null || String(transactionAmountRaw).trim() === "") {
          throw new Error("MERCADO_PAGO_PRICE no está configurado. Configuralo en Environments o en la variable de entorno.");
        }
        const transactionAmount = Number(transactionAmountRaw);
        const response = await mercadoPagoGateway.createPreapproval(mpEmail, transactionAmount);
        const { id, init_point, status } = response;
        const modelStatus = mapMpStatusToModel(status);
        await subscriptionPlanRepository.save({
          userId: user.id,
          status: modelStatus,
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
            const user = await userRepository.getById(userData.userId);
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
