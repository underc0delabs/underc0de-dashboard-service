import cron from "node-cron";
import { DependencyManager } from "../dependencyManager.js";
import { getSubscriptionPlanActions } from "../modules/subscriptionPlan/core/actions/actionsProvider.js";
import { ISubscriptionPlanRepository } from "../modules/subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { MercadoPagoSyncService } from "../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { IPaymentRepository } from "../modules/payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../modules/users/core/repository/IMongoUserRepository.js";

export function startMercadoPagoSyncCron(dependencyManager: DependencyManager) {
  cron.schedule(
    "0 3 * * *",
    async () => {
      try {
        const subscriptionPlanRepository = dependencyManager.resolve(
          "subscriptionPlanRepository"
        ) as ISubscriptionPlanRepository;
        const mercadoPagoSyncService = dependencyManager.resolve(
          "mercadoPagoSyncService"
        ) as MercadoPagoSyncService;
        const paymentRepository = dependencyManager.resolve(
          "paymentRepository"
        ) as IPaymentRepository;
        const userRepository = dependencyManager.resolve(
          "userRepository"
        ) as IUserRepository;
        const subscriptionPlanActions = getSubscriptionPlanActions(
          subscriptionPlanRepository,
          mercadoPagoSyncService,
          paymentRepository,
          userRepository
        );
        await subscriptionPlanActions.syncMercadoPago.execute();
      } catch (error) {
        console.error("[MP SYNC] Sync failed", error);
      }
    },
    {
      timezone: "America/Argentina/Buenos_Aires",
    }
  );
}
