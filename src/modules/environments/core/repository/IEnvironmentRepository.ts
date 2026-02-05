import IEnvironment from "../entities/IEnvironment.js";

export interface IEnvironmentRepository {
  getByKey(key: string): Promise<IEnvironment | null>;
  updateByKey(key: string, value: string): Promise<IEnvironment | null>;
}
