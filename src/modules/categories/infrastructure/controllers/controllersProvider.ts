import { DependencyManager } from "../../../../dependencyManager.js";
import { getCategoryActions } from "../../core/actions/actionsProvider.js";
import { ICategoryRepository } from "../../core/repository/ICategoryRepository.js";
import { CategoryControllers } from "./CategoryControllers.js";

export const getCategoryControllers = (dependencyManager: DependencyManager) => {
  const CategoryRepository = dependencyManager.resolve(
    "categoryRepository",
  ) as ICategoryRepository;
  const CategoryActions = getCategoryActions(CategoryRepository);
  return CategoryControllers(CategoryActions);
};
