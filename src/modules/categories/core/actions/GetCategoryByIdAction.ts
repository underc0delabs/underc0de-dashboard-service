import { CategoryNotExistException } from "../exceptions/CategoryNotExistException.js";
import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface IGetCategoryByIdAction {
  execute: (id: string) => Promise<unknown>;
}

export const GetCategoryByIdAction = (
  CategoryRepository: ICategoryRepository,
): IGetCategoryByIdAction => ({
  execute(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const category = await CategoryRepository.getById(id);
        if (!category) throw new CategoryNotExistException();
        resolve(category);
      } catch (error) {
        reject(error);
      }
    });
  },
});
