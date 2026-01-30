export default interface IPushNotification {
    id?: string,
    title: string,
    message: string,
    audience: string,
    status: string,
    createdBy: number,
    modifiedBy?: number
    userId?: string,
}

