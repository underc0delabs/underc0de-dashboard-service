export class PaymentNotExistException extends Error {
    constructor(message?: string){
        super(message || "Pago inexistente")
        this.name= 'PaymentNotExistException'
    }
}

