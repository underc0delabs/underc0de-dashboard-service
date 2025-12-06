export class SubscriptionPlanNotExistException extends Error {
    constructor(message?: string){
        super(message || "Plan de suscripción inexistente")
        this.name= 'SubscriptionPlanNotExistException'
    }
}

