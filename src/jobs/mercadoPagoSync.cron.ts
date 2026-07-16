import cron from "node-cron";
import { DependencyManager } from "../dependencyManager.js";
import { getSubscriptionPlanActions } from "../modules/subscriptionPlan/core/actions/actionsProvider.js";
import { ISubscriptionPlanRepository } from "../modules/subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { MercadoPagoSyncService } from "../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { IPaymentRepository } from "../modules/payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../modules/users/core/repository/IMongoUserRepository.js";
import { MercadoPagoGateway } from "../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import { IEnvironmentRepository } from "../modules/environments/core/repository/IEnvironmentRepository.js";

const resolveSubscriptionPlanActions = (dependencyManager: DependencyManager) => {
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
  const mercadoPagoGateway = dependencyManager.resolve(
    "mercadoPagoGateway"
  ) as MercadoPagoGateway;
  const environmentRepository = dependencyManager.resolve(
    "environmentRepository"
  ) as IEnvironmentRepository;

  return getSubscriptionPlanActions(
    subscriptionPlanRepository,
    mercadoPagoSyncService,
    paymentRepository,
    userRepository,
    mercadoPagoGateway,
    environmentRepository
  );
};

const runMercadoPagoSync = async (dependencyManager: DependencyManager) => {
  const startedAt = Date.now();
  const subscriptionPlanActions = resolveSubscriptionPlanActions(dependencyManager);
  const result = await subscriptionPlanActions.syncMercadoPago.execute();
  console.log("[MP SYNC cron] Completado", {
    durationMs: Date.now() - startedAt,
    subscriptionsCreated: result?.subscriptionsCreated ?? 0,
    subscriptionsUpdated: result?.subscriptionsUpdated ?? 0,
    paymentsSaved: result?.paymentsSaved ?? 0,
    usersRevoked: result?.usersRevoked ?? 0,
    stalePlansCancelled: result?.stalePlansCancelled ?? 0,
  });
  return result;
};

export function startMercadoPagoSyncCron(dependencyManager: DependencyManager) {
  /** Cada 6 horas (03:00, 09:00, 15:00, 21:00 ART). Complementa webhook + sync manual del admin. */
  cron.schedule(
    "0 */6 * * *",
    async () => {
      try {
        await runMercadoPagoSync(dependencyManager);
      } catch (error) {
        console.error("[MP SYNC cron] Sync failed", error);
      }
    },
    {
      timezone: "America/Argentina/Buenos_Aires",
    }
  );
}
