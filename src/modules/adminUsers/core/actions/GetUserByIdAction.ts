import { IAdminUserRepository } from "../repository/IAdminUserRepository";
export interface IGetAdminUserByIdAction {
  execute: (id: string) => Promise<any>;
}
export const GetAdminUserByIdAction = (
  AdminUserRepository: IAdminUserRepository
): IGetAdminUserByIdAction => {
  return {
    execute(id) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await AdminUserRepository.getById(id);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
