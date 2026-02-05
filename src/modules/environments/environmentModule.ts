import { DependencyManager } from "../../dependencyManager.js";
import { EnvironmentRepository } from "./infrastructure/repository/EnvironmentRepository.js";

export const EnvironmentModule = (dependencyManager: DependencyManager) => {
  dependencyManager.register("environmentRepository", EnvironmentRepository());
};
