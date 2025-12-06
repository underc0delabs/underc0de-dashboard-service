export class UserNotExistException extends Error {
    constructor(message?: string){
        super(message || "Usuario inexistente")
        this.name= 'UserNotExistException'
    }
}