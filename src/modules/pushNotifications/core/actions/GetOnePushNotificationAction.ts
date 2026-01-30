import { IPushNotificationRepository } from "../repository/IPushNotificationRepository.js";
export interface IGetOnePushNotificationAction {
    execute: (query:object) => Promise<any>
}
export const GetOnePushNotificationAction = (PushNotificationRepository: IPushNotificationRepository):IGetOnePushNotificationAction => {
    return {
        execute(query) {
          return new Promise(async (resolve, reject) => {
            try {
              const pushNotification = await PushNotificationRepository.getOne(query)
              resolve(pushNotification)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

