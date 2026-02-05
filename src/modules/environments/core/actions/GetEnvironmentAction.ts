import { IEnvironmentRepository } from "../repository/IEnvironmentRepository.js";
import { EnvironmentNotExistException } from "../exceptions/EnvironmentNotExistException.js";

export interface IGetEnvironmentAction {
  execute: (key: string) => Promise<any>;
}

export const GetEnvironmentAction = (
  EnvironmentRepository: IEnvironmentRepository
): IGetEnvironmentAction => {
  return {
    execute: async (key: string) => {
      const environment = await EnvironmentRepository.getByKey(key);
      if (!environment) throw new EnvironmentNotExistException();
      return environment;
    },
  };
};
