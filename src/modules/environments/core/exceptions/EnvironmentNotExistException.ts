export class EnvironmentNotExistException extends Error {
  constructor() {
    super("La variable de entorno no existe");
    this.name = "EnvironmentNotExistException";
  }
}
