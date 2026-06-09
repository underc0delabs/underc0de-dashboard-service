export class CategoryInUseException extends Error {
  constructor() {
    super("La categoría está asociada a uno o más comercios");
    this.name = CategoryInUseException.name;
  }
}
