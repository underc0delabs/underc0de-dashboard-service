import { IEnvironmentRepository } from "../repository/IEnvironmentRepository.js";
import { EnvironmentNotExistException } from "../exceptions/EnvironmentNotExistException.js";

export interface IUpdateEnvironmentAction {
  execute: (key: string, value: string) => Promise<any>;
}

export const UpdateEnvironmentAction = (
  EnvironmentRepository: IEnvironmentRepository
): IUpdateEnvironmentAction => {
  return {
    execute: async (key: string, value: string) => {
      const environment = await EnvironmentRepository.updateByKey(key, value);
      if (!environment) throw new EnvironmentNotExistException();
      return environment;
    },
  };
};
