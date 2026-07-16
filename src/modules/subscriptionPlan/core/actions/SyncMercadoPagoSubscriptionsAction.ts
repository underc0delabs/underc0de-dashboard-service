import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import {
  isInternalPreapprovalId,
  isMpManagedPreapprovalId,
} from "../domain/subscriptionPlanHelpers.js";

const cancelStaleActiveMpPlans = async (
  mpAuthorizedIds: Set<string>,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): Promise<number> => {
  let cancelled = 0;
  let page = 0;
  const pageSize = 500;

  while (true) {
    const result = await subscriptionPlanRepository.get({
      status: "ACTIVE",
      page_count: pageSize,
      page_number: page,
    });
    const plans = result?.subscriptionPlans ?? [];
    if (!plans.length) break;

    for (const row of plans) {
      const plan = (row as any).toJSON?.() ?? row;
      const mpId = String(plan.mpPreapprovalId ?? "");
      if (!isMpManagedPreapprovalId(mpId)) continue;
      if (mpAuthorizedIds.has(mpId)) continue;

      await subscriptionPlanRepository.edit(
        { status: "CANCELLED" } as any,
        String(plan.id)
      );
      cancelled++;
      console.log("[MP SYNC] Cancelled stale ACTIVE plan (not authorized in MP)", {
        planId: plan.id,
        mpPreapprovalId: mpId,
        userId: plan.userId,
      });
    }

    if (plans.length < pageSize) break;
    page++;
  }

  return cancelled;
};

const cancelUserStaleActiveMpPlans = async (
  userId: number | string,
  mpAuthorizedIds: Set<string>,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): Promise<void> => {
  const result = await subscriptionPlanRepository.get({
    userId,
    status: "ACTIVE",
    page_count: 50,
    page_number: 0,
  });
  const plans = result?.subscriptionPlans ?? [];
  for (const row of plans) {
    const plan = (row as any).toJSON?.() ?? row;
    const mpId = String(plan.mpPreapprovalId ?? "");
    if (!isMpManagedPreapprovalId(mpId)) continue;
    if (mpAuthorizedIds.has(mpId)) continue;
    await subscriptionPlanRepository.edit(
      { status: "CANCELLED" } as any,
      String(plan.id)
    );
  }
};

export interface ISyncMercadoPagoSubscriptionsAction {
  execute: () => Promise<any>;
}

export const SyncMercadoPagoSubscriptionsAction = (
  mercadoPagoSyncService: MercadoPagoSyncService,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  paymentRepository: IPaymentRepository,
  userRepository: IUserRepository
): ISyncMercadoPagoSubscriptionsAction => {
  return {
    execute: async () => {
      const mpSubscriptions = await mercadoPagoSyncService.syncSubscriptions();
      console.log("[MP SYNC] Suscripciones desde MP:", mpSubscriptions.length);

      let subscriptionsCreated = 0;
      let subscriptionsUpdated = 0;
      let paymentsSaved = 0;

      if (mpSubscriptions.length > 0) {
      for (const mpSub of mpSubscriptions) {
        const preapprovalId = String(mpSub.id);

        const existing = await subscriptionPlanRepository.getOne({
          mpPreapprovalId: preapprovalId,
        });
        const existingUserId =
          existing?.userId ??
          (existing as any)?.toJSON?.()?.userId ??
          (typeof (existing as any)?.get === "function"
            ? (existing as any).get("userId")
            : null);

        let payerEmail =
          (mpSub as any).payer_email?.trim?.() ||
          (mpSub as any).payer_email_address?.trim?.();
        if (!payerEmail) {
          const detail = await mercadoPagoSyncService.getPreapprovalById(preapprovalId);
          const d = detail as any;
          payerEmail = (
            d?.payer_email ||
            d?.payer_email_address ||
            d?.payer?.email
          )?.trim?.();
        }

        const mpPayments = await mercadoPagoSyncService.syncPayments(mpSub);
        if (!payerEmail && mpPayments?.length) {
          const firstPayment = mpPayments[0] as any;
          payerEmail = (
            firstPayment?.payer?.email ||
            firstPayment?.payer_email ||
            firstPayment?.payer?.email_address
          )?.trim?.();
        }

        let user =
          existingUserId != null
            ? await userRepository.getById(String(existingUserId))
            : null;
        if (!user && mpSub.payer_id) {
          user = await userRepository.getOne({ mpPayerId: String(mpSub.payer_id) });
        }
        if (!user && payerEmail) {
          user =
            (await userRepository.getOneByEmailIgnoreCase(payerEmail)) ??
            (await userRepository.getOneByMercadopagoEmailIgnoreCase(payerEmail));
        }

        const subscriptionPayload = {
          userId: user?.id ?? existingUserId ?? null,
          status: mpSub.status === "authorized" ? "ACTIVE" : "CANCELLED",
          startedAt: new Date(mpSub.date_created),
          nextPaymentDate: calculateNextPaymentDate(mpSub),
          mpPreapprovalId: preapprovalId,
        };
        let persistedSubscription;
        if (!existing) {
          persistedSubscription =
            await subscriptionPlanRepository.save(subscriptionPayload as any);
          subscriptionsCreated++;
        } else {
          await subscriptionPlanRepository.edit(
            subscriptionPayload as any,
            existing.id.toString()
          );
          persistedSubscription = existing;
          subscriptionsUpdated++;
        }

        const effectiveUserId = subscriptionPayload.userId;
        if (effectiveUserId != null) {
          const userUpdatePayload: Record<string, unknown> = {
            is_pro: subscriptionPayload.status === "ACTIVE",
            mpPayerId: String(mpSub.payer_id),
          };
          const hasMercadopagoEmail = (user as any)?.mercadopago_email?.trim?.();
          if (payerEmail && !hasMercadopagoEmail) {
            userUpdatePayload.mercadopago_email = payerEmail;
          }
          const [affectedRows] = (await userRepository.edit(
            userUpdatePayload as any,
            String(effectiveUserId)
          )) as [number];
        }

        for (const mpPayment of mpPayments) {
          const mpPaymentId = String(mpPayment.id);
          const exists = await paymentRepository.getOne({
            mpPaymentId: mpPaymentId,
          });

          if (exists) continue;

          await paymentRepository.save({
            userSubscriptionId: persistedSubscription.id,
            status: mpPayment.status,
            mpPaymentId: mpPaymentId,
            amount: mpPayment.transaction_amount,
            currency: mpPayment.currency_id || "ARS",
            paidAt: mpPayment.date_approved
              ? new Date(mpPayment.date_approved)
              : new Date(mpPayment.date_created || ""),
          } as any);

          paymentsSaved++;
        }
      }
      }

      const mpAuthorizedIds = new Set(
        mpSubscriptions
          .filter((s: any) => s.status === "authorized")
          .map((s: any) => String(s.id))
      );

      let revokedCount = 0;
      let stalePlansCancelled = 0;

      stalePlansCancelled = await cancelStaleActiveMpPlans(
        mpAuthorizedIds,
        subscriptionPlanRepository
      );

      const proUsersResult = await userRepository.get({ is_pro: true });
      const proUsers = proUsersResult?.users ?? [];
      for (const u of proUsers) {
        const userJson = u.toJSON ? u.toJSON() : u;
        const plans = userJson.subscriptionPlans ?? [];
        const hasInternalPlan = plans.some((p: any) =>
          isInternalPreapprovalId(p.mpPreapprovalId)
        );
        if (hasInternalPlan) continue;
        const hasActiveInMp = plans.some(
          (p: any) =>
            p.status === "ACTIVE" &&
            mpAuthorizedIds.has(String(p.mpPreapprovalId ?? ""))
        );
        if (hasActiveInMp) continue;

        await cancelUserStaleActiveMpPlans(
          userJson.id,
          mpAuthorizedIds,
          subscriptionPlanRepository
        );
        await userRepository.edit(
          { ...userJson, is_pro: false } as any,
          String(userJson.id)
        );
        revokedCount++;
        console.log("[MP SYNC] Revoked is_pro (no active subscription in MP)", {
          userId: userJson.id,
        });
      }

      return {
        success: true,
        subscriptionsCreated,
        subscriptionsUpdated,
        paymentsSaved,
        usersRevoked: revokedCount,
        stalePlansCancelled,
      };
    },
  };
};

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
