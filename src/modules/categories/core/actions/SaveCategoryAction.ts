import ICategory from "../entities/ICategory.js";
import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface ISaveCategoryAction {
  execute: (body: ICategory) => Promise<ICategory>;
}

export const SaveCategoryAction = (
  CategoryRepository: ICategoryRepository,
): ISaveCategoryAction => ({
  execute(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const name = String(body.name ?? "").trim();
        if (!name) {
          reject(new Error("El nombre es requerido"));
          return;
        }
        const result = await CategoryRepository.save({
          name,
          status: body.status ?? true,
          sortOrder: Number(body.sortOrder ?? 0),
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
});
