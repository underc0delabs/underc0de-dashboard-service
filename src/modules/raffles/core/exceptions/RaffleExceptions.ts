export class RaffleNotFoundException extends Error {
  constructor(message = "Sorteo no encontrado") {
    super(message);
    this.name = "RaffleNotFoundException";
  }
}

export class RaffleConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RaffleConflictException";
  }
}

export class RaffleValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RaffleValidationException";
  }
}

export class RaffleForbiddenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RaffleForbiddenException";
  }
}
