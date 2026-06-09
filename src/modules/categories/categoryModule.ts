import { DependencyManager } from "../../dependencyManager.js";
import { CategoryRepository } from "./infrastructure/repository/CategoryRepository.js";

export const CategoryModuleInitializer = (
  dependencyManager: DependencyManager,
) => {
  const categoryRepository = CategoryRepository();
  dependencyManager.register("categoryRepository", categoryRepository);
};
