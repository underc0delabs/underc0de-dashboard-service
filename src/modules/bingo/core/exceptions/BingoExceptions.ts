export class BingoEventNotFoundException extends Error {
  constructor(message = "Evento de bingo no encontrado") {
    super(message);
    this.name = "BingoEventNotFoundException";
  }
}

export class BingoStandNotFoundException extends Error {
  constructor(message = "Stand no encontrado") {
    super(message);
    this.name = "BingoStandNotFoundException";
  }
}

export class BingoConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BingoConflictException";
  }
}

export class BingoValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BingoValidationException";
  }
}

export class BingoForbiddenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BingoForbiddenException";
  }
}
