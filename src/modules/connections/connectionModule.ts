import { DependencyManager } from "../../dependencyManager.js";
import { ConnectionRepository } from "./infrastructure/repository/ConnectionRepository.js";

export const ConnectionModuleInitializer = (
  dependencyManager: DependencyManager,
) => {
  const connectionRepository = ConnectionRepository();
  dependencyManager.register("connectionRepository", connectionRepository);
};
