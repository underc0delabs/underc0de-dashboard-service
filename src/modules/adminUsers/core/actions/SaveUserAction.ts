import IAdminUser from "../entities/IAdminUser.js";
import { IAdminUserRepository } from "../repository/IAdminUserRepository.js";
import { IHashService } from "../services/IHashService.js";

export interface ISaveUserAction {
  execute: (body: IAdminUser) => Promise<any>;
}

export const SaveUserAction = (
  AdminUserRepository: IAdminUserRepository,
  hashService: IHashService
): ISaveUserAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = {
            ...body,
            createdAt: new Date(body.createdAt || new Date()),
            password: hashService.hash(body.password),
            rol: body.role == "editor" ? "Editor" : "Admin",
          };
          const result = await AdminUserRepository.save(user);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
