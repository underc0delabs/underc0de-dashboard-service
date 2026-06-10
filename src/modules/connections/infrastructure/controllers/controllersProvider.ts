import { DependencyManager } from "../../../../dependencyManager.js";
import { getConnectionActions } from "../../core/actions/connectionActionsProvider.js";
import { IConnectionRepository } from "../repository/ConnectionRepository.js";
import { ConnectionControllers } from "./ConnectionControllers.js";

export const getConnectionControllers = (dependencyManager: DependencyManager) => {
  const connectionRepository = dependencyManager.resolve(
    "connectionRepository",
  ) as IConnectionRepository;
  const actions = getConnectionActions(connectionRepository);
  return ConnectionControllers(actions);
};
