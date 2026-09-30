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
import {
  calculateNextPaymentDateFromMpDetail,
  isInternalPreapprovalId,
} from "../domain/subscriptionPlanHelpers.js";
import { mapMpDetailStatusToModel } from "../domain/subscriptionStatusPolicy.js";
import { resolveMercadoPagoPreapprovalForReconcile } from "../domain/resolveMercadoPagoPreapprovalForReconcile.js";
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
      preapproval_id: string;
      match_source: string;
    }
  | { ok: false; status: 404 | 422 | 502; message: string };

export interface IReconcileMercadoPagoUserAction {
  execute: (appUserId: string) => Promise<ReconcileMercadoPagoUserResult>;
}

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
    const userJson = (user as any).toJSON ? (user as any).toJSON() : user;

    let resolvedPreapproval: Awaited<
      ReturnType<typeof resolveMercadoPagoPreapprovalForReconcile>
    >;
    try {
      resolvedPreapproval = await resolveMercadoPagoPreapprovalForReconcile(
        mercadoPagoSyncService,
        userJson,
        jsonPlans
      );
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

    if (!resolvedPreapproval) {
      return {
        ok: false,
        status: 422,
        message:
          "El usuario no tiene una suscripción MercadoPago asociada en el sistema",
      };
    }

    const preapprovalId = resolvedPreapproval.preapprovalId;
    const detail = resolvedPreapproval.detail;

    const mpStatusRaw = String(detail.status ?? "");
    const mappedStatus = mapMpDetailStatusToModel(mpStatusRaw);
    console.log("[MP reconcile user] resolved preapproval", {
      userId: targetUserId,
      preapprovalId,
      matchSource: resolvedPreapproval.matchSource,
      mpStatusRaw,
      mappedStatus,
    });
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
      nextPaymentDate: calculateNextPaymentDateFromMpDetail(detail),
      mpPreapprovalId: preapprovalId,
      provider: "mercadopago",
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
      jsonPlans.find((p: any) => String(p.mpPreapprovalId) === preapprovalId)?.id;

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
    const userJsonSnapshot = userJson;
    const hasMercadopagoEmail = userJsonSnapshot?.mercadopago_email?.trim?.();
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
      preapproval_id: preapprovalId,
      match_source: resolvedPreapproval.matchSource,
    };
  },
});
