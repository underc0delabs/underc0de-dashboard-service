import axios from "axios";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js";

const OWNER_PREAPPROVAL_PREFIX = "owner-";

import {
  mapMpCreateStatusToModel,
} from "../domain/subscriptionStatusPolicy.js";

/** Política PENDING obsoleto: al iniciar un nuevo checkout, las filas PENDING del mismo usuario pasan a CANCELLED (nuevo intento reemplaza el anterior). */
const cancelPreviousPendingCheckouts = async (
  userId: number,
  subscriptionPlanRepository: ISubscriptionPlanRepository
) => {
  const result = await subscriptionPlanRepository.get({
    userId,
    status: "PENDING",
    page_count: 100,
    page_number: 0,
  });
  const plans = result?.subscriptionPlans ?? [];
  for (const row of plans) {
    const id = (row as any).id ?? (row as any).dataValues?.id;
    if (id == null) continue;
    await subscriptionPlanRepository.edit(
      { status: "CANCELLED" } as any,
      String(id)
    );
  }
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
    } as any);
  }
  await userRepository.edit(
    { ...user, is_pro: true } as any,
    user.id.toString()
  );
  return { status: "ACTIVE", init_point: null, is_owner: true };
};

export interface ICreateSubscriptionAction {
  execute: (userData: { userId: string; mercadopagoEmail?: string }) => Promise<any>;
}

export const CreateSubscriptionAction = (
  mercadoPagoGateway: MercadoPagoGateway,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userRepository: IUserRepository,
  environmentRepository: IEnvironmentRepository
): ICreateSubscriptionAction => {
  return {
    execute: async (userData: { userId: string; mercadopagoEmail?: string }) => {
      try {
        const user = await userRepository.getById(userData.userId);
        if (!user) throw new Error("Usuario no encontrado");

        const userEmail = (user as any).email?.trim?.();
        if (!userEmail) throw new Error("El usuario no tiene email asociado");

        const incomingMpEmail = userData.mercadopagoEmail?.trim?.();
        if (incomingMpEmail) {
          await userRepository.edit(
            { mercadopago_email: incomingMpEmail } as any,
            userData.userId
          );
        }

        const collectorEmail = process.env.MERCADO_PAGO_COLLECTOR_EMAIL?.trim().toLowerCase();
        const mpEmail =
          incomingMpEmail ||
          (user as any).mercadopago_email?.trim?.() ||
          userEmail;
        const isCollector =
          collectorEmail &&
          (userEmail.toLowerCase() === collectorEmail ||
            (user as any).mercadopago_email?.trim?.().toLowerCase() === collectorEmail);

        if (isCollector) {
          return grantOwnerSubscription(user, subscriptionPlanRepository, userRepository);
        }

        let transactionAmountRaw: string | number | undefined;
        try {
          const envRow = await environmentRepository.getByKey("MERCADO_PAGO_PRICE");
          transactionAmountRaw = envRow?.value;
        } catch {
          transactionAmountRaw = undefined;
        }
        transactionAmountRaw = transactionAmountRaw ?? process.env.MERCADO_PAGO_PRICE;
        if (transactionAmountRaw == null || String(transactionAmountRaw).trim() === "") {
          throw new Error("MERCADO_PAGO_PRICE no está configurado. Configuralo en Environments o en la variable de entorno.");
        }
        const transactionAmount = Number(transactionAmountRaw);
        await cancelPreviousPendingCheckouts(
          user.id,
          subscriptionPlanRepository
        );

        const response = await mercadoPagoGateway.createPreapproval(mpEmail, transactionAmount);
        const { id, init_point, status } = response;
        const modelStatus = mapMpCreateStatusToModel(status);
        await subscriptionPlanRepository.save({
          userId: user.id,
          status: modelStatus,
          startedAt: new Date(),
          mpPreapprovalId: id,
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
