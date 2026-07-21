import { DependencyManager } from "../../dependencyManager.js";
import { BingoRepository } from "./infrastructure/repository/BingoRepository.js";

export const BingoModuleInitializer = (dependencyManager: DependencyManager) => {
  const bingoRepository = BingoRepository();
  dependencyManager.register("bingoRepository", bingoRepository);
};
