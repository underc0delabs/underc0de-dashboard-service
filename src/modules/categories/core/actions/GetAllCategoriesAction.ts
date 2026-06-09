import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface IGetAllCategoriesAction {
  execute: (query?: Record<string, unknown>) => Promise<{ categories: unknown[] }>;
}

export const GetAllCategoriesAction = (
  CategoryRepository: ICategoryRepository,
): IGetAllCategoriesAction => ({
  execute(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await CategoryRepository.get(query ?? {});
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
});
