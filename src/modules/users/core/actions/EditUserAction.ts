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

/** Acepta "ACTIVE"|"CANCELLED", "Activa"|"Cancelada", o objeto { value/label/status } del front. */
const normalizeSubscriptionStatus = (v: unknown): "ACTIVE" | "CANCELLED" | null => {
  const str =
    typeof v === "string"
      ? v
      : v && typeof v === "object" && "value" in (v as any)
        ? (v as any).value
        : v && typeof v === "object" && "label" in (v as any)
          ? (v as any).label
          : v && typeof v === "object" && "status" in (v as any)
            ? (v as any).status
            : null;
  if (str == null || typeof str !== "string") return null;
  const u = String(str).trim().toUpperCase();
  if (u === "ACTIVE" || u === "ACTIVA" || u === "ACTIVO") return "ACTIVE";
  if (u === "CANCELLED" || u === "CANCELADA" || u === "CANCELADO" || u === "INACTIVA" || u === "INACTIVE") return "CANCELLED";
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
          const rawSub =
            (rawBody as any).subscriptionStatus ??
            (rawBody as any).suscription ??
            (rawBody as any).subscription ??
            (rawBody as any).Subscription ??
            (rawBody as any).estadoSuscripcion;
          const subscriptionStatus = normalizeSubscriptionStatus(rawSub);
          if (subscriptionStatus !== null) {
            console.log("[EditUser] Actualizando suscripción", { userId: id, subscriptionStatus, rawSubscription: rawSub });
          }

          const payload = buildUpdatePayload(rawBody, hashService);
          if (subscriptionStatus !== null) {
            payload.is_pro = subscriptionStatus === "ACTIVE";
          }
          const hasUserUpdates = Object.keys(payload).length > 0;

          if (hasUserUpdates) {
            await UserRepository.edit(payload as any, id);
          }

          if (subscriptionStatus !== null) {
            const userIdNum = Number(id);
            const firstDayNextMonth = (() => {
              const d = new Date();
              d.setMonth(d.getMonth() + 1);
              d.setDate(1);
              d.setHours(0, 0, 0, 0);
              return d;
            })();

            /** Suscripción más reciente del usuario (get ordena por createdAt DESC) */
            let subscription: any = null;
            try {
              const result = await subscriptionPlanRepository.get({
                userId: userIdNum,
                page_count: 5,
                page_number: 0,
              });
              const plans = (result as any).subscriptionPlans ?? [];
              subscription = Array.isArray(plans) ? plans[0] : null;
              if (subscription && typeof subscription.toJSON === "function") {
                subscription = subscription.toJSON();
              }
            } catch (e) {
              console.warn("[EditUser] Error al buscar suscripciones", e);
            }

            const adminPreapprovalId = `admin-${id}`;
            if (!subscription && subscriptionStatus === "ACTIVE") {
              subscription = await subscriptionPlanRepository.getOne({ mpPreapprovalId: adminPreapprovalId });
            }

            if (subscriptionStatus === "ACTIVE") {
              if (subscription) {
                const subId = (subscription as any).id;
                await subscriptionPlanRepository.edit(
                  {
                    status: "ACTIVE",
                    nextPaymentDate: firstDayNextMonth,
                  } as any,
                  String(subId)
                );
                console.log("[EditUser] Suscripción actualizada a ACTIVE", { userId: id, subscriptionId: subId });
              } else {
                await subscriptionPlanRepository.save({
                  userId: userIdNum,
                  status: "ACTIVE",
                  startedAt: new Date(),
                  nextPaymentDate: firstDayNextMonth,
                  mpPreapprovalId: adminPreapprovalId,
                } as any);
                console.log("[EditUser] Suscripción creada (admin)", { userId: id, mpPreapprovalId: adminPreapprovalId });
              }
            } else {
              if (subscription) {
                const subId = (subscription as any).id;
                await subscriptionPlanRepository.edit(
                  { status: "CANCELLED" } as any,
                  String(subId)
                );
                console.log("[EditUser] Suscripción actualizada a CANCELLED", { userId: id, subscriptionId: subId });
              }
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
