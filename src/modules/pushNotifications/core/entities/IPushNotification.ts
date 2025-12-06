export default interface IPushNotification {
    title: string,
    message: string,
    audience: string,
    status: string,
    createdBy: number,
    modifiedBy?: number
}

