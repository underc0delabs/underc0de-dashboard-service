export class InvalidIdException extends Error {
    constructor(message?: string){
        super(message || "El id es invalido")
        this.name='InvalidIdException' 
    }
}

