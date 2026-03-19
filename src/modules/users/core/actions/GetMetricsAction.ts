import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository.js";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";

export interface IGetMetricsAction {
  execute: () => Promise<any>;
}
export const GetMetricsAction = (
  UserRepository: IUserRepository,
  merchantsRepository: IMerchantRepository,
  notificationsRepository: IPushNotificationRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): IGetMetricsAction => {
  return {
    execute() {
      return new Promise(async (resolve, reject) => {
        try {
          const [usersResult, merchantsResult, notificationsResult, activeSubs, cancelledSubs] =
            await Promise.all([
              UserRepository.get({}),
              merchantsRepository.get({}),
              notificationsRepository.get({}),
              subscriptionPlanRepository.get({ status: "ACTIVE", page_count: 10000, page_number: 0 }),
              subscriptionPlanRepository.get({ status: "CANCELLED", page_count: 10000, page_number: 0 }),
            ]);
          const activeCount = activeSubs?.pagination?.total ?? (activeSubs?.subscriptionPlans?.length ?? 0);
          const cancelledCount = cancelledSubs?.pagination?.total ?? (cancelledSubs?.subscriptionPlans?.length ?? 0);
          resolve({
            users: usersResult.users?.length || 0,
            merchants: merchantsResult.merchants?.length || 0,
            notifications: notificationsResult.pushNotifications?.length || 0,
            subscriptionsActive: activeCount,
            subscriptionsCancelled: cancelledCount,
            subscriptions: activeCount + cancelledCount,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
