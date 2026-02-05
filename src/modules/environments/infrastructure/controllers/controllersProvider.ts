import { DependencyManager } from "../../../../dependencyManager.js";
import { getEnvironmentActions } from "../../core/actions/actionsProvider.js";
import { IEnvironmentRepository } from "../../core/repository/IEnvironmentRepository.js";
import { EnvironmentControllers } from "./EnvironmentControllers.js";

export const getEnvironmentControllers = (
  dependencyManager: DependencyManager,
) => {
  const environmentRepository = dependencyManager.resolve(
    "environmentRepository",
  ) as IEnvironmentRepository;
  const environmentActions = getEnvironmentActions(environmentRepository);
  return EnvironmentControllers(environmentActions);
};
