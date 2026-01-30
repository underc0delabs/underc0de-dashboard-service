import { IPushNotificationRepository } from "../repository/IPushNotificationRepository.js";
export interface IGetAllPushNotificationsAction {
    execute: (query:any) => Promise<any>
}
export const GetAllPushNotificationsAction = (PushNotificationRepository: IPushNotificationRepository):IGetAllPushNotificationsAction => {
    return {
        execute(query) {
            return new Promise(async (resolve, reject) => {
                try {
                  const pushNotifications = await PushNotificationRepository.get(query)
                  resolve(pushNotifications)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

