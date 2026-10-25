import IUser from "../entities/IUser.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { lifetimeNextPaymentDate } from "../domain/userVipPolicy.js";
import { parseBirthday } from "../../../../helpers/parseBirthday.js";

const EDIT_ALLOWED_KEYS = [
  "username",
  "name",
  "lastname",
  "phone",
  "email",
  "idNumber",
  "userType",
  "birthday",
  "country",
  "province",
  "status",
  "fcmToken",
  "mpPayerId",
  "mercadopago_email",
  "is_pro",
  "password",
] as const;

const PRIVILEGED_EDIT_KEYS = new Set(["is_pro", "mpPayerId"]);

/** Normaliza body: acepta mercadopagoEmail (camelCase) y subscriptionStatus / suscription del front */
const buildUpdatePayload = (
  body: any,
  hashService: IHashService,
  isAdminEdit: boolean
): Record<string, unknown> => {
  const raw: Record<string, unknown> = {
    ...body,
    mercadopago_email:
      body.mercadopago_email ?? body.mercadopagoEmail ?? undefined,
  };
  const payload: Record<string, unknown> = {};
  for (const key of EDIT_ALLOWED_KEYS) {
    if (!isAdminEdit && PRIVILEGED_EDIT_KEYS.has(key)) continue;
    if (raw[key] !== undefined && raw[key] !== null) {
      payload[key] = raw[key];
    }
  }
  if (payload.password) {
    payload.password = hashService.hash(String(payload.password));
  }
  if (payload.birthday != null && typeof payload.birthday === "string") {
    payload.birthday = parseBirthday(String(payload.birthday));
  }
  return payload;
};

/** Cancela los planes ACTIVE del usuario; con keepSubId conserva ese plan. */
const cancelActivePlans = async (
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userIdNum: number,
  keepSubId: number | null
) => {
  const result = await subscriptionPlanRepository.get({
    userId: userIdNum,
    status: "ACTIVE",
    page_count: 100,
    page_number: 0,
  });
  const plans = (result as any).subscriptionPlans ?? [];
  for (const p of plans) {
    const row = p?.toJSON ? p.toJSON() : p;
    if (row.status !== "ACTIVE") continue;
    if (keepSubId != null && Number(row.id) === keepSubId) continue;
    await subscriptionPlanRepository.edit(
      { status: "CANCELLED" } as any,
      String(row.id)
    );
  }
};

/**
 * Quita todo acceso PRO del usuario desde el panel. Además de cancelar los planes ACTIVE se vence
 * `nextPaymentDate` (una fila CANCELLED con fecha futura cuenta como "cancelada con acceso hasta X"
 * y dejaría al usuario VIP, p. ej. la concesión con fecha 2099).
 */
const revokeAllAccess = async (
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userIdNum: number
) => {
  const result = await subscriptionPlanRepository.get({
    userId: userIdNum,
    page_count: 100,
    page_number: 0,
  });
  const plans = (result as any).subscriptionPlans ?? [];
  const now = Date.now();
  const expired = new Date(now - 24 * 60 * 60 * 1000);
  for (const p of plans) {
    const row = p?.toJSON ? p.toJSON() : p;
    if (row.status === "ACTIVE") {
      await subscriptionPlanRepository.edit(
        { status: "CANCELLED", nextPaymentDate: expired } as any,
        String(row.id)
      );
    } else if (
      row.status === "CANCELLED" &&
      row.nextPaymentDate &&
      new Date(row.nextPaymentDate).getTime() > now
    ) {
      await subscriptionPlanRepository.edit(
        { nextPaymentDate: expired } as any,
        String(row.id)
      );
    }
  }
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
  execute: (
    body: IUser,
    id: string,
    options?: { isAdminEdit?: boolean }
  ) => Promise<any>;
}
export const EditUserAction = (
  UserRepository: IUserRepository,
  hashService: IHashService,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): IEditUserAction => {
  return {
    execute(body, id, options) {
      return new Promise(async (resolve, reject) => {
        try {
          const isAdminEdit = options?.isAdminEdit === true;
          const rawBody = body || {};
          const rawSub =
            (rawBody as any).subscriptionStatus ??
            (rawBody as any).suscription ??
            (rawBody as any).subscription ??
            (rawBody as any).Subscription ??
            (rawBody as any).estadoSuscripcion;
          const subscriptionStatus = isAdminEdit
            ? normalizeSubscriptionStatus(rawSub)
            : null;
          const payload = buildUpdatePayload(rawBody, hashService, isAdminEdit);
          if (subscriptionStatus !== null) {
            payload.is_pro = subscriptionStatus === "ACTIVE";
          }
          const hasUserUpdates = Object.keys(payload).length > 0;

          if (hasUserUpdates) {
            await UserRepository.edit(payload as any, id);
          }

          if (subscriptionStatus !== null) {
            const userIdNum = Number(id);

            if (subscriptionStatus === "ACTIVE") {
              /**
               * Siempre una concesión interna `admin-<id>`: las sincronizaciones con Mercado Pago
               * (refresh de la app, webhook, cron, botón del panel) solo respetan estas filas.
               * Reutilizar la última fila de MP la dejaba ACTIVE con un id real de MP, y el
               * siguiente sync la revertía a lo que dice MP.
               */
              const adminPreapprovalId = `admin-${id}`;
              const existingGrant: any = await subscriptionPlanRepository.getOne({
                mpPreapprovalId: adminPreapprovalId,
              });
              const grantRow = existingGrant?.toJSON
                ? existingGrant.toJSON()
                : existingGrant;
              let grantId: number;
              if (grantRow) {
                grantId = Number(grantRow.id);
                await subscriptionPlanRepository.edit(
                  {
                    status: "ACTIVE",
                    nextPaymentDate: lifetimeNextPaymentDate(),
                  } as any,
                  String(grantId)
                );
              } else {
                const created: any = await subscriptionPlanRepository.save({
                  userId: userIdNum,
                  status: "ACTIVE",
                  startedAt: new Date(),
                  nextPaymentDate: lifetimeNextPaymentDate(),
                  mpPreapprovalId: adminPreapprovalId,
                } as any);
                const createdRow = created?.toJSON ? created.toJSON() : created;
                grantId = Number(createdRow?.id);
              }
              await cancelActivePlans(
                subscriptionPlanRepository,
                userIdNum,
                Number.isFinite(grantId) ? grantId : null
              );
            } else {
              // Desactivar desde el panel quita todo acceso, incluida la concesión interna.
              await revokeAllAccess(subscriptionPlanRepository, userIdNum);
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
