import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

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
      if (!mpSubscriptions.length) {
        return { success: true, synced: 0 };
      }
      let subscriptionsCreated = 0;
      let subscriptionsUpdated = 0;
      let paymentsSaved = 0;

      for (const mpSub of mpSubscriptions) {
        const preapprovalId = String(mpSub.id);
        let payerEmail =
          (mpSub as any).payer_email?.trim?.() ||
          (mpSub as any).payer_email_address?.trim?.();
        if (!payerEmail) {
          const detail = await mercadoPagoSyncService.getPreapprovalById(preapprovalId);
          payerEmail = (
            (detail as any)?.payer_email ||
            (detail as any)?.payer_email_address ||
            (detail as any)?.payer?.email
          )?.trim?.();
        }

        const mpPayments = await mercadoPagoSyncService.syncPayments(mpSub);
        if (!payerEmail && mpPayments?.length) {
          const firstPayment = mpPayments[0] as any;
          payerEmail = (
            firstPayment?.payer?.email ||
            firstPayment?.payer_email
          )?.trim?.();
        }

        let user = mpSub.payer_id
          ? await userRepository.getOne({ mpPayerId: String(mpSub.payer_id) })
          : null;
        if (!user && payerEmail) {
          user =
            (await userRepository.getOneByEmailIgnoreCase(payerEmail)) ??
            (await userRepository.getOneByMercadopagoEmailIgnoreCase(payerEmail));
        }
        const existing = await subscriptionPlanRepository.getOne({
          mpPreapprovalId: preapprovalId,
        });
        const subscriptionPayload = {
          userId: user?.id ?? existing?.userId ?? null,
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
          if (affectedRows === 0) {
            console.warn("[MP SYNC] No se encontró usuario para actualizar (id inexistente)", {
              userId: effectiveUserId,
              preapprovalId,
            });
          } else {
            console.log("[MP SYNC] Usuario actualizado", {
              userId: effectiveUserId,
              is_pro: subscriptionPayload.status === "ACTIVE",
            });
          }
        } else {
          console.warn("[MP SYNC] Suscripción sin userId (no se encontró usuario por mpPayerId ni por email)", {
            preapprovalId,
            payer_id: mpSub.payer_id,
            payer_email: payerEmail || "(no disponible)",
          });
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

      return {
        success: true,
        subscriptionsCreated,
        subscriptionsUpdated,
        paymentsSaved,
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
