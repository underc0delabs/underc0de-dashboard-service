export class MemberNotFoundException extends Error {
  constructor(message = "Miembro interno no encontrado") {
    super(message);
    this.name = "MemberNotFoundException";
  }
}
