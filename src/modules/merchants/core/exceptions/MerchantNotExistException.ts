export class MerchantNotExistException extends Error {
    constructor(message?: string){
        super(message || "Comercio inexistente")
        this.name= 'MerchantNotExistException'
    }
}

