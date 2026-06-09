import MerchantModel from "../../../merchants/infrastructure/models/MerchantModel.js";
import { CategoryInUseException } from "../exceptions/CategoryInUseException.js";
import { CategoryNotExistException } from "../exceptions/CategoryNotExistException.js";
import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface IRemoveCategoryAction {
  execute: (id: string) => Promise<{ id: string }>;
}

export const RemoveCategoryAction = (
  CategoryRepository: ICategoryRepository,
): IRemoveCategoryAction => ({
  execute(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const existing = await CategoryRepository.getById(id);
        if (!existing) throw new CategoryNotExistException();

        const inUse = await MerchantModel.count({ where: { category: id } });
        if (inUse > 0) throw new CategoryInUseException();

        await CategoryRepository.remove(id);
        resolve({ id });
      } catch (error) {
        reject(error);
      }
    });
  },
});
