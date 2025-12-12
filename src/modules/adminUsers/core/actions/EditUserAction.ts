import IAdminUser from "../entities/IAdminUser";
import { IAdminUserRepository } from "../repository/IAdminUserRepository";
import { IHashService } from "../services/IHashService";

export interface IEditAdminUserAction {
  execute: (body: IAdminUser, id: string) => Promise<any>;
}
export const EditAdminUserAction = (
  AdminUserRepository: IAdminUserRepository,
  hashService: IHashService
): IEditAdminUserAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          const { password } = body;
          if (password) {
            body.password = hashService.hash(password);
          }
          await AdminUserRepository.edit({
            ...body,
            rol: body.role == "editor" ? "Editor" : "Admin",
            updatedAt: new Date(),
          }, id);
          const result = await AdminUserRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
