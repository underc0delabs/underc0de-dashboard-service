import IUser from "../entities/IUser.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";

export interface IEditUserAction {
  execute: (body: IUser, id: string) => Promise<any>;
}
export const EditUserAction = (
  UserRepository: IUserRepository,
  hashService: IHashService
): IEditUserAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          const { password } = body;
          if (password) {
            body.password = hashService.hash(password);
          }
          await UserRepository.edit(body, id);
          const result = await UserRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
