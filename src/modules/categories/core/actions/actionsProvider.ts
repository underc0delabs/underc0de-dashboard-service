import { EditCategoryAction, IEditCategoryAction } from "./EditCategoryAction.js";
import {
  GetAllCategoriesAction,
  IGetAllCategoriesAction,
} from "./GetAllCategoriesAction.js";
import {
  GetCategoryByIdAction,
  IGetCategoryByIdAction,
} from "./GetCategoryByIdAction.js";
import { IRemoveCategoryAction, RemoveCategoryAction } from "./RemoveCategoryAction.js";
import { ISaveCategoryAction, SaveCategoryAction } from "./SaveCategoryAction.js";
import { ICategoryRepository } from "../repository/ICategoryRepository.js";

export interface ICategoryActions {
  save: ISaveCategoryAction;
  edit: IEditCategoryAction;
  remove: IRemoveCategoryAction;
  getAll: IGetAllCategoriesAction;
  getById: IGetCategoryByIdAction;
}

export const getCategoryActions = (CategoryRepository: ICategoryRepository) => {
  const CategoryActions: ICategoryActions = {
    save: SaveCategoryAction(CategoryRepository),
    edit: EditCategoryAction(CategoryRepository),
    remove: RemoveCategoryAction(CategoryRepository),
    getAll: GetAllCategoriesAction(CategoryRepository),
    getById: GetCategoryByIdAction(CategoryRepository),
  };
  return CategoryActions;
};
