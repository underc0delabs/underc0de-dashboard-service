import IPushNotification from "../entities/IPushNotification";
import { IPushNotificationRepository } from "../repository/IPushNotificationRepository";

export interface ISavePushNotificationAction {
  execute: (body: IPushNotification) => Promise<any>;
}

export const SavePushNotificationAction = (
  PushNotificationRepository: IPushNotificationRepository
): ISavePushNotificationAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          console.log(" body ", body)
          const result = await PushNotificationRepository.save(body);
          resolve(result);
        } catch (error) {
          console.log(" error ", error)
          reject(error);
        }
      });
    },
  };
};

