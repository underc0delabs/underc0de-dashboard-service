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
          const usersResult = await UserRepository.get({});
          const merchantsResult = await merchantsRepository.get({});
          const notificationsResult = await notificationsRepository.get({});
          resolve({
            users: usersResult.users?.length || 0,
            merchants: merchantsResult.merchants?.length || 0,
            notifications: notificationsResult.pushNotifications?.length || 0
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
