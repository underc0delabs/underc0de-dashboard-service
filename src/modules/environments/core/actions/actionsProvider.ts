import { IEnvironmentRepository } from "../repository/IEnvironmentRepository.js";
import { GetEnvironmentAction, IGetEnvironmentAction } from "./GetEnvironmentAction.js";
import { UpdateEnvironmentAction, IUpdateEnvironmentAction } from "./UpdateEnvironmentAction.js";

export interface IEnvironmentActions {
  getEnvironment: IGetEnvironmentAction;
  updateEnvironment: IUpdateEnvironmentAction;
}

export const getEnvironmentActions = (
  EnvironmentRepository: IEnvironmentRepository
) => {
  const EnvironmentActions: IEnvironmentActions = {
    getEnvironment: GetEnvironmentAction(EnvironmentRepository),
    updateEnvironment: UpdateEnvironmentAction(EnvironmentRepository),
  };
  return EnvironmentActions;
};
