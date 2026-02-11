import IUser from "../entities/IUser.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";

const EDIT_ALLOWED_KEYS = [
  "name",
  "lastname",
  "phone",
  "email",
  "idNumber",
  "userType",
  "birthday",
  "status",
  "fcmToken",
  "mpPayerId",
  "mercadopago_email",
  "is_pro",
  "password",
] as const;

/** Normaliza body: acepta mercadopagoEmail (camelCase) y subscriptionStatus / suscription del front */
const buildUpdatePayload = (body: any, hashService: IHashService): Record<string, unknown> => {
  const raw: Record<string, unknown> = {
    ...body,
    mercadopago_email:
      body.mercadopago_email ?? body.mercadopagoEmail ?? undefined,
  };
  const payload: Record<string, unknown> = {};
  for (const key of EDIT_ALLOWED_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      payload[key] = raw[key];
    }
  }
  if (payload.password) {
    payload.password = hashService.hash(String(payload.password));
  }
  return payload;
};

/** Acepta "ACTIVE"|"CANCELLED" o "Activa"|"Activo"|"Cancelada"|"Inactiva" etc. */
const normalizeSubscriptionStatus = (v: string | null | undefined): "ACTIVE" | "CANCELLED" | null => {
  if (v == null || typeof v !== "string") return null;
  const u = v.trim().toUpperCase();
  if (u === "ACTIVE" || u === "ACTIVA" || u === "ACTIVO") return "ACTIVE";
  if (u === "CANCELLED" || u === "CANCELADA" || u === "CANCELADO" || u === "INACTIVA") return "CANCELLED";
  return null;
};

export interface IEditUserAction {
  execute: (body: IUser, id: string) => Promise<any>;
}
export const EditUserAction = (
  UserRepository: IUserRepository,
  hashService: IHashService,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): IEditUserAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          const rawBody = body || {};
          const subscriptionStatus = normalizeSubscriptionStatus(
            rawBody.subscriptionStatus ?? rawBody.suscription ?? rawBody.subscription
          );

          const payload = buildUpdatePayload(rawBody, hashService);
          if (subscriptionStatus !== null) {
            payload.is_pro = subscriptionStatus === "ACTIVE";
          }
          const hasUserUpdates = Object.keys(payload).length > 0;

          if (hasUserUpdates) {
            await UserRepository.edit(payload as any, id);
          }

          if (subscriptionStatus !== null) {
            const subscription = await subscriptionPlanRepository.getOne({ userId: id });
            if (subscription) {
              const subId = (subscription as any).id;
              await subscriptionPlanRepository.edit(
                { status: subscriptionStatus } as any,
                String(subId)
              );
            }
          }

          const result = await UserRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
