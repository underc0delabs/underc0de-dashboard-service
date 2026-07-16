import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository.js";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository.js";

export interface IGetMetricsAction {
  execute: () => Promise<any>;
}
export const GetMetricsAction = (
  UserRepository: IUserRepository,
  merchantsRepository: IMerchantRepository,
  notificationsRepository: IPushNotificationRepository
): IGetMetricsAction => {
  return {
    execute() {
      return new Promise(async (resolve, reject) => {
        try {
          const [usersResult, merchantsResult, notificationsResult] = await Promise.all([
            UserRepository.get({}),
            merchantsRepository.get({}),
            notificationsRepository.get({}),
          ]);
          const users = usersResult.users ?? [];
          const proActivosHoy = users.filter((u: any) => u.vip === true).length;
          const proCancelados = users.filter((u: any) => {
            if (u.vip === true) return false;
            const status = String(u.subscription?.status ?? "").toUpperCase();
            return status === "CANCELLED";
          }).length;
          resolve({
            users: users.length,
            merchants: merchantsResult.merchants?.length || 0,
            notifications: notificationsResult.pushNotifications?.length || 0,
            subscriptionsActive: proActivosHoy,
            subscriptionsCancelled: proCancelados,
            subscriptions: proActivosHoy,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
