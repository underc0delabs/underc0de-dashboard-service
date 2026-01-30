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
      if (!mpSubscriptions.length) {
        return { success: true, synced: 0 };
      }
      let subscriptionsCreated = 0;
      let subscriptionsUpdated = 0;
      let paymentsSaved = 0;

      for (const mpSub of mpSubscriptions) {
        const preapprovalId = String(mpSub.id);
        console.log("mpSub", mpSub);
        const user = mpSub.payer_id
          ? await userRepository.getOne({ mpPayerId: String(mpSub.payer_id)})
          : null;
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

        const mpPayments =
          await mercadoPagoSyncService.syncPayments(mpSub);

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
  if (!mpSubscription.auto_recurring?.start_date) return null;

  const start = new Date(mpSubscription.auto_recurring.start_date);
  const freq = mpSubscription.auto_recurring.frequency || 1;
  const type = mpSubscription.auto_recurring.frequency_type || "months";

  const next = new Date(start);

  if (type === "months") next.setMonth(next.getMonth() + freq);
  if (type === "days") next.setDate(next.getDate() + freq);

  return next;
};
