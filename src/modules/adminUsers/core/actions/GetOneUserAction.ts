import { IAdminUserRepository } from "../repository/IAdminUserRepository";
export interface IGetOneUserAction {
  execute: (query: object) => Promise<any>;
}
export const GetOneUserAction = (
  AdminUserRepository: IAdminUserRepository
): IGetOneUserAction => {
  return {
    execute(query) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await AdminUserRepository.getOne(query);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
