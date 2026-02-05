import { IEnvironmentRepository } from "../../core/repository/IEnvironmentRepository.js";
import EnvironmentModel from "../models/EnvironmentModel.js";
import IEnvironment from "../../core/entities/IEnvironment.js";

export const EnvironmentRepository = (): IEnvironmentRepository => ({
  async getByKey(key: string) {
    const environment = await EnvironmentModel.findOne({ where: { key } });
    return environment ? (environment.toJSON() as IEnvironment) : null;
  },
  
  async updateByKey(key: string, value: string) {
    const environment = await EnvironmentModel.findOne({ where: { key } });
    
    if (!environment) {
      return null;
    }
    
    await environment.update({ value });
    return environment.toJSON() as IEnvironment;
  },
});
