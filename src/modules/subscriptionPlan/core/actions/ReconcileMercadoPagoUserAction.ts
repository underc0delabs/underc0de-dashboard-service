/**
 * Reconciliación MercadoPago para un solo usuario de la app (admin).
 * Lógica alineada con el bucle por suscripción de SyncMercadoPagoSubscriptionsAction
 * sin modificar ese archivo ni el worker/cron global.
 */
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { MpSubscription } from "../../../../services/mercadopagoService/core/types/mercadoPagoTypes.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { isInternalPreapprovalId } from "../domain/subscriptionPlanHelpers.js";
import { mapMpDetailStatusToModel } from "../domain/subscriptionStatusPolicy.js";
import { resolveIsProAfterMpSync } from "../../../users/core/domain/userVipPolicy.js";

const demoteOtherActiveSubscriptions = async (
  userId: number | string,
  exceptSubscriptionId: string | number,
  subscriptionPlanRepository: ISubscriptionPlanRepository
) => {
  const result = await subscriptionPlanRepository.get({
    userId,
    status: "ACTIVE",
    page_count: 200,
    page_number: 0,
  });
  const plans = result?.subscriptionPlans ?? [];
  for (const row of plans) {
    const plan = (row as any).toJSON?.() ?? row;
    const id = plan.id ?? plan.dataValues?.id;
    if (isInternalPreapprovalId(plan.mpPreapprovalId)) continue;
    if (id == null || String(id) === String(exceptSubscriptionId)) continue;
    await subscriptionPlanRepository.edit({ status: "CANCELLED" } as any, String(id));
  }
};

export type ReconcileMercadoPagoUserResult =
  | {
      ok: true;
      mp_status: string;
      local_subscription_status: string;
      user_is_pro: boolean;
      payments_saved: number;
    }
  | { ok: false; status: 404 | 422 | 502; message: string };

export interface IReconcileMercadoPagoUserAction {
  execute: (appUserId: string) => Promise<ReconcileMercadoPagoUserResult>;
}

const calculateNextPaymentDate = (mpSubscription: any): Date | null => {
  if (mpSubscription.next_payment_date)
    return new Date(mpSubscription.next_payment_date);
  if (!mpSubscription.auto_recurring?.start_date) return null;

  const start = new Date(mpSubscription.auto_recurring.start_date);
  const freq = mpSubscription.auto_recurring.frequency || 1;
  const type = mpSubscription.auto_recurring.frequency_type || "months";

  const next = new Date(start);
  if (type === "months") next.setMonth(next.getMonth() + freq);
  if (type === "days") next.setDate(next.getDate() + freq);

  return next;
};

export const ReconcileMercadoPagoUserAction = (
  mercadoPagoSyncService: MercadoPagoSyncService,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  paymentRepository: IPaymentRepository,
  userRepository: IUserRepository
): IReconcileMercadoPagoUserAction => ({
  execute: async (targetUserId: string) => {
    const user = await userRepository.getById(String(targetUserId));
    if (!user) {
      return { ok: false, status: 404, message: "Usuario no encontrado" };
    }

    const plansResult = await subscriptionPlanRepository.get({
      userId: targetUserId,
      page_count: 100,
      page_number: 0,
    });
    const plans = plansResult?.subscriptionPlans ?? [];
    const jsonPlans = plans.map((p: any) => (p.toJSON ? p.toJSON() : p));
    const candidates = jsonPlans.filter(
      (p: any) =>
        p.mpPreapprovalId && !isInternalPreapprovalId(p.mpPreapprovalId)
    );
    const byRecency = (a: any, b: any) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return Number(b?.id ?? 0) - Number(a?.id ?? 0);
    };
    const sorted = [...candidates].sort(byRecency);
    const newest = sorted[0];
    // Si el intento más reciente es PENDING, reconciliarlo (p. ej. re-suscripción con fila
    // ACTIVE vieja aún no bajada); no usar .find(ACTIVE) sobre toda la lista, que devolvía
    // un ACTIVE obsoleto antes que el PENDING más nuevo.
    const planWithMp =
      newest?.status === "PENDING"
        ? newest
        : sorted.find((p: any) => p.status === "ACTIVE") ?? newest;

    if (!planWithMp?.mpPreapprovalId) {
      return {
        ok: false,
        status: 422,
        message:
          "El usuario no tiene una suscripción MercadoPago asociada en el sistema",
      };
    }

    const preapprovalId = String(planWithMp.mpPreapprovalId);

    let detail: any;
    try {
      detail = await mercadoPagoSyncService.getPreapprovalById(preapprovalId);
    } catch (e: any) {
      console.error(
        "[MP reconcile user] MercadoPago error",
        e?.message ?? e
      );
      return {
        ok: false,
        status: 502,
        message:
          "MercadoPago no disponible o error al consultar el preapproval",
      };
    }

    if (!detail) {
      return {
        ok: false,
        status: 404,
        message: "Preapproval no encontrado en MercadoPago",
      };
    }

    const mpStatusRaw = String((detail as any).status ?? "");
    const mappedStatus = mapMpDetailStatusToModel(mpStatusRaw);
    const mpSub: MpSubscription = {
      id: preapprovalId,
      status: mpStatusRaw === "authorized" ? "authorized" : "cancelled",
      payer_id: (detail as any).payer_id,
      payer_email:
        (detail as any).payer_email || (detail as any).payer_email_address,
      date_created:
        (detail as any).date_created || new Date().toISOString(),
      auto_recurring: (detail as any).auto_recurring,
    };

    let payerEmail =
      (mpSub as any).payer_email?.trim?.() ||
      String((detail as any).payer_email_address ?? "").trim();
    if (!payerEmail) {
      payerEmail = String((detail as any)?.payer?.email ?? "").trim();
    }

    let mpPayments: any[] = [];
    try {
      mpPayments = await mercadoPagoSyncService.syncPayments(mpSub);
    } catch (e) {
      mpPayments = [];
    }

    if (!payerEmail && mpPayments?.length) {
      const firstPayment = mpPayments[0] as any;
      payerEmail = (
        firstPayment?.payer?.email ||
        firstPayment?.payer_email ||
        firstPayment?.payer?.email_address
      )?.trim?.();
    }

    const existing = await subscriptionPlanRepository.getOne({
      mpPreapprovalId: preapprovalId,
    });

    const subscriptionPayload = {
      userId: targetUserId,
      status: mappedStatus,
      startedAt: new Date(mpSub.date_created),
      nextPaymentDate: calculateNextPaymentDate(mpSub as any),
      mpPreapprovalId: preapprovalId,
    };

    let persistedSubscription: any;
    if (!existing) {
      persistedSubscription = await subscriptionPlanRepository.save(
        subscriptionPayload as any
      );
    } else {
      await subscriptionPlanRepository.edit(
        subscriptionPayload as any,
        existing.id.toString()
      );
      persistedSubscription = existing;
    }

    const persistedId =
      (persistedSubscription as any).id ??
      (persistedSubscription as any).toJSON?.()?.id ??
      planWithMp.id;

    await demoteOtherActiveSubscriptions(
      targetUserId,
      persistedId,
      subscriptionPlanRepository
    );

    const refreshedUser = await userRepository.getById(String(targetUserId));
    const userPlans = (refreshedUser as any)?.subscriptionPlans ?? [];
    const resolvedIsPro = resolveIsProAfterMpSync(
      mappedStatus === "ACTIVE",
      userPlans
    );

    const userUpdatePayload: Record<string, unknown> = {
      is_pro: resolvedIsPro,
      mpPayerId: String(mpSub.payer_id),
    };
    const userJson = (user as any).toJSON ? (user as any).toJSON() : user;
    const hasMercadopagoEmail = userJson?.mercadopago_email?.trim?.();
    if (payerEmail && !hasMercadopagoEmail) {
      userUpdatePayload.mercadopago_email = payerEmail;
    }

    const [affectedRows] = (await userRepository.edit(
      userUpdatePayload as any,
      String(targetUserId)
    )) as [number];

    let paymentsSaved = 0;
    for (const mpPayment of mpPayments) {
      const mpPaymentId = String(mpPayment.id);
      const exists = await paymentRepository.getOne({ mpPaymentId });
      if (exists) continue;

      await paymentRepository.save({
        userSubscriptionId: persistedSubscription.id,
        status: mpPayment.status,
        mpPaymentId,
        amount: mpPayment.transaction_amount,
        currency: mpPayment.currency_id || "ARS",
        paidAt: mpPayment.date_approved
          ? new Date(mpPayment.date_approved)
          : new Date(mpPayment.date_created || ""),
      } as any);

      paymentsSaved++;
    }

    return {
      ok: true,
      mp_status: mpStatusRaw,
      local_subscription_status: mappedStatus,
      user_is_pro: resolvedIsPro,
      payments_saved: paymentsSaved,
    };
  },
});
