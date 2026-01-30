import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IAdminUserRepository } from "../repository/IAdminUserRepository.js";
import { IHashService } from "../services/IHashService.js";
import { EditAdminUserAction, IEditAdminUserAction } from "./EditUserAction.js";
import { GetAllUsersAction, IGetAllUsersAction } from "./GetAllUsersAction.js";
import { GetOneUserAction, IGetOneUserAction } from "./GetOneUserAction.js";
import {
  GetAdminUserByIdAction,
  IGetAdminUserByIdAction,
} from "./GetUserByIdAction.js";
import {
  GetUsersMetricsAction,
  IGetUsersMetricsAction,
} from "./GetUsersMetricsAction.js";
import { ILoginUserAction, LoginUserAction } from "./LoginUserAction.js";
import { IRemoveAdminUserAction, RemoveUserAction } from "./RemoveUserAction.js";
import { ISaveUserAction, SaveUserAction } from "./SaveUserAction.js";

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
