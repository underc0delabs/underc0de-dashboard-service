export class CategoryNotExistException extends Error {
  constructor() {
    super("La categoría no existe");
    this.name = CategoryNotExistException.name;
  }
}
