import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository";
import { IAdminUserRepository } from "../repository/IAdminUserRepository";
import { IHashService } from "../services/IHashService";
import { EditAdminUserAction, IEditAdminUserAction } from "./EditUserAction";
import { GetAllUsersAction, IGetAllUsersAction } from "./GetAllUsersAction";
import { GetOneUserAction, IGetOneUserAction } from "./GetOneUserAction";
import {
  GetAdminUserByIdAction,
  IGetAdminUserByIdAction,
} from "./GetUserByIdAction";
import {
  GetUsersMetricsAction,
  IGetUsersMetricsAction,
} from "./GetUsersMetricsAction";
import { ILoginUserAction, LoginUserAction } from "./LoginUserAction";
import { IRemoveAdminUserAction, RemoveUserAction } from "./RemoveUserAction";
import { ISaveUserAction, SaveUserAction } from "./SaveUserAction";

export interface IAdminUserActions {
  save: ISaveUserAction;
  edit: IEditAdminUserAction;
  remove: IRemoveAdminUserAction;
  getAll: IGetAllUsersAction;
  getOne: IGetOneUserAction;
  getById: IGetAdminUserByIdAction;
  login: ILoginUserAction;
  getUsersMetrics: IGetUsersMetricsAction;
}
export const getAdminUserActions = (
  AdminUserRepository: IAdminUserRepository,
  hashService: IHashService,
  UserRepository: IUserRepository
) => {
  const AdminUserActions: IAdminUserActions = {
    save: SaveUserAction(AdminUserRepository, hashService),
    edit: EditAdminUserAction(AdminUserRepository, hashService),
    remove: RemoveUserAction(AdminUserRepository),
    getAll: GetAllUsersAction(AdminUserRepository),
    getById: GetAdminUserByIdAction(AdminUserRepository),
    getOne: GetOneUserAction(AdminUserRepository),
    login: LoginUserAction(AdminUserRepository, hashService),
    getUsersMetrics: GetUsersMetricsAction(UserRepository, AdminUserRepository),
  };
  return AdminUserActions;
};
