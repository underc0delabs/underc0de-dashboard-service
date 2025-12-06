import { IAdminUserRepository } from "../repository/IAdminUserRepository";
export interface IGetAllUsersAction {
  execute: (query: any) => Promise<any>;
}
export const GetAllUsersAction = (
  AdminUserRepository: IAdminUserRepository
): IGetAllUsersAction => {
  return {
    execute(query) {
      return new Promise(async (resolve, reject) => {
        try {
          const users = await AdminUserRepository.get(query);
          resolve(users);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
