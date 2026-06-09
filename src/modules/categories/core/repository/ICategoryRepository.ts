import ICategory from "../entities/ICategory.js";

export interface ICategoryRepository {
  save: (category: ICategory) => Promise<ICategory>;
  edit: (category: Partial<ICategory>, id: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  get: (query?: Record<string, unknown>) => Promise<{ categories: ICategory[] }>;
  getById: (id: string) => Promise<ICategory | null>;
  getOne: (query: Record<string, unknown>) => Promise<ICategory | null>;
}
