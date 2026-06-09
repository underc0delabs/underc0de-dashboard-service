import ICategory from "../entities/ICategory.js";
import { CategoryNotExistException } from "../exceptions/CategoryNotExistException.js";
import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface IEditCategoryAction {
  execute: (body: Partial<ICategory>, id: string) => Promise<ICategory>;
}

export const EditCategoryAction = (
  CategoryRepository: ICategoryRepository,
): IEditCategoryAction => ({
  execute(body, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const existing = await CategoryRepository.getById(id);
        if (!existing) throw new CategoryNotExistException();

        const payload: Partial<ICategory> = {};
        if (body.name !== undefined) {
          const name = String(body.name).trim();
          if (!name) {
            reject(new Error("El nombre es requerido"));
            return;
          }
          payload.name = name;
        }
        if (body.status !== undefined) payload.status = Boolean(body.status);
        if (body.sortOrder !== undefined) {
          payload.sortOrder = Number(body.sortOrder);
        }

        await CategoryRepository.edit(payload, id);
        const updated = await CategoryRepository.getById(id);
        if (!updated) throw new CategoryNotExistException();
        resolve(updated);
      } catch (error) {
        reject(error);
      }
    });
  },
});
