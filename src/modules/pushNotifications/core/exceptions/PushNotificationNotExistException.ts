export class PushNotificationNotExistException extends Error {
    constructor(message?: string){
        super(message || "Notificación push inexistente")
        this.name= 'PushNotificationNotExistException'
    }
}

