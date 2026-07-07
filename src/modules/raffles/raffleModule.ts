import { DependencyManager } from "../../dependencyManager.js";
import { RaffleRepository } from "./infrastructure/repository/RaffleRepository.js";

export const RaffleModuleInitializer = (
  dependencyManager: DependencyManager,
) => {
  const raffleRepository = RaffleRepository();
  dependencyManager.register("raffleRepository", raffleRepository);
};
