import IPushNotification from "../entities/IPushNotification.js";

export interface IPushNotificationRepository {
    save: (pushNotification: IPushNotification) => Promise<IPushNotification>,
    edit: (pushNotification: IPushNotification, id: string) => Promise<any>,
    remove: (id: string) => Promise<any>,
    get: (query: any) => Promise<any>,
    getOne: (query: any) => Promise<any>,
    getById: (id: string) => Promise<any>,
}

