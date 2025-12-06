import { IAdminUserRepository } from "../repository/IAdminUserRepository";

export interface IRemoveAdminUserAction {
  execute: (id: string) => Promise<any>;
}

export const RemoveUserAction = (
  AdminUserRepository: IAdminUserRepository
): IRemoveAdminUserAction => {
  return {
    execute(id) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await AdminUserRepository.getById(id);
          await AdminUserRepository.remove(id);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
