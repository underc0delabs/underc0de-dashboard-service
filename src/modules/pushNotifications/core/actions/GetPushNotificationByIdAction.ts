import { PushNotificationNotExistException } from "../exceptions/PushNotificationNotExistException.js";
import { IPushNotificationRepository } from "../repository/IPushNotificationRepository.js";
export interface IGetPushNotificationByIdAction {
    execute: (id:string) => Promise<any>
}
export const GetPushNotificationByIdAction = (PushNotificationRepository: IPushNotificationRepository):IGetPushNotificationByIdAction => {
    return {
        execute(id) {
          return new Promise(async (resolve, reject) => {
            try {
              const pushNotification = await PushNotificationRepository.getById(id)
              if(!pushNotification) throw new PushNotificationNotExistException()
              resolve(pushNotification)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

