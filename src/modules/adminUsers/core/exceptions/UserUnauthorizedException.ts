export class UserUnauthorizedException extends Error {
    constructor(message?: string){
        super(message || "Usuario no autorizado")
        this.name= 'UserUnauthorizedException'
    }
}