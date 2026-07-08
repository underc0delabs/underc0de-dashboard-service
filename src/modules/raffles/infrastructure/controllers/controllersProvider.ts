import { DependencyManager } from "../../../../dependencyManager.js";
import type { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { RaffleActionsProvider } from "../../core/actions/raffleActionsProvider.js";
import type { IRaffleRepository } from "../repository/RaffleRepository.js";
import { RaffleControllers } from "./RaffleControllers.js";

export const getRaffleControllers = (dependencyManager: DependencyManager) => {
  const raffleRepository = dependencyManager.resolve(
    "raffleRepository",
  ) as IRaffleRepository;
  const fileStorageService = dependencyManager.resolve("fileStorageService") as {
    saveFile: (
      file: Express.Multer.File,
      subfolder: string,
    ) => Promise<string>;
  };
  const userRepository = dependencyManager.resolve(
    "userRepository",
  ) as IUserRepository;

  const actions = RaffleActionsProvider(
    raffleRepository,
    fileStorageService,
    userRepository,
  );
  return RaffleControllers(actions);
};
