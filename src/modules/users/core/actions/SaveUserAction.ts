import IUser from "../entities/IUser";
import { IUserRepository } from "../repository/IMongoUserRepository";
import { IHashService } from "../services/IHashService";

export interface ISaveUserAction {
  execute: (body: IUser) => Promise<any>;
}

export const SaveUserAction = (
  UserRepository: IUserRepository,
  hashService: IHashService
): ISaveUserAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = {
            ...body,
            password: hashService.hash(body.password),
          };
          const result = await UserRepository.save(user);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
