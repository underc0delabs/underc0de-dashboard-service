export class UserNotActiveException extends Error {
    constructor(message?: string){
        super(message || "El usuario se encuentra desactivado")
        this.name='UserNotActiveException'
        
    }
}