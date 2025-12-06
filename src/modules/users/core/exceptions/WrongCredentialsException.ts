export class WrongCredentialsException extends Error {
    constructor(message?: string){
        super(message || "Usuario o contraseña incorrectos")
        this.name='WrongCredentialsException'
    }
}