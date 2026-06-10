export class ConnectionNotFoundException extends Error {
  constructor(message?: string) {
    super(message || "Conexión inexistente");
    this.name = "ConnectionNotFoundException";
  }
}

export class SelfActionException extends Error {
  constructor(message?: string) {
    super(message || "No podés realizar esta acción sobre vos mismo");
    this.name = "SelfActionException";
  }
}

export class ConnectionConflictException extends Error {
  constructor(message?: string) {
    super(message || "La acción no está permitida en el estado actual");
    this.name = "ConnectionConflictException";
  }
}

export class UserBlockedException extends Error {
  constructor(message?: string) {
    super(message || "No podés interactuar con este usuario");
    this.name = "UserBlockedException";
  }
}
