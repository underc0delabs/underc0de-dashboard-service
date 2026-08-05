import { DependencyManager } from "../../../../dependencyManager.js";
import { BingoActionsProvider } from "../../core/actions/bingoActionsProvider.js";
import { BingoAuthActionsProvider } from "../../core/actions/bingoAuthActionsProvider.js";
import type { IBingoRepository } from "../repository/BingoRepository.js";
import { BingoControllers } from "./BingoControllers.js";
import { BingoAuthControllers } from "./BingoAuthControllers.js";

const getBingoRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("bingoRepository") as IBingoRepository;
};

export const getBingoControllers = (dependencyManager: DependencyManager) => {
  const bingoRepository = getBingoRepository(dependencyManager);
  const fileStorageService = dependencyManager.resolve("fileStorageService") as {
    saveFile: (file: Express.Multer.File, subfolder: string) => Promise<string>;
  };
  const actions = BingoActionsProvider(bingoRepository, fileStorageService);
  return BingoControllers(actions);
};

export const getBingoAuthControllers = (dependencyManager: DependencyManager) => {
  const bingoRepository = getBingoRepository(dependencyManager);
  const authActions = BingoAuthActionsProvider(bingoRepository);
  return BingoAuthControllers(authActions);
};
