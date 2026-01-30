import IUser from "../../../users/core/entities/IUser.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { IAdminUserRepository } from "../repository/IAdminUserRepository.js";
import { UserUnauthorizedException } from "../exceptions/UserUnauthorizedException.js";

export interface IGetUsersMetricsAction {
  execute: (userAdminId: string) => Promise<any>;
}

export const GetUsersMetricsAction = (
  UserRepository: IUserRepository,
  AdminUserRepository: IAdminUserRepository
): IGetUsersMetricsAction => {
  return {
    execute(userAdminId) {
      return new Promise(async (resolve, reject) => {
        try {
          const userAdmin = await AdminUserRepository.getById(userAdminId);
          if (!userAdmin) throw new UserNotExistException();
          if (userAdmin.rol !== "Admin") throw new UserUnauthorizedException();
          const metrics = await UserRepository.get({});
          resolve({
            totalUsers: metrics.total,
            activeUsers: metrics.users.filter((user: IUser) => user.status)
              .length,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
