import IPushNotification from "../entities/IPushNotification";
import { IPushNotificationRepository } from "../repository/IPushNotificationRepository";

export interface IEditPushNotificationAction {
  execute: (body: IPushNotification, id: string) => Promise<any>;
}
export const EditPushNotificationAction = (
  PushNotificationRepository: IPushNotificationRepository
): IEditPushNotificationAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          await PushNotificationRepository.edit(body, id);
          const result = await PushNotificationRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

