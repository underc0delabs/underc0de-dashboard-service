import { IPushNotificationRepository } from "../repository/IPushNotificationRepository";
import { PushNotificationNotExistException } from "../exceptions/PushNotificationNotExistException";
import { InvalidIdException } from "../exceptions/InvalidIdException";

export interface IRemovePushNotificationAction {
    execute: (id:string) => Promise<any>
}

export const RemovePushNotificationAction = (PushNotificationRepository: IPushNotificationRepository):IRemovePushNotificationAction => {
    return {
        execute(id) {
            return new Promise(async (resolve, reject) => {
                try {
                  const pushNotification = await PushNotificationRepository.getById(id)
                  if (!pushNotification) throw new PushNotificationNotExistException()
                  await PushNotificationRepository.remove(id)
                  resolve(pushNotification)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

