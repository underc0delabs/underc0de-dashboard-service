import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";
import { EditUserAction, IEditUserAction } from "./EditUserAction.js";
import { GetAllUsersAction, IGetAllUsersAction } from "./GetAllUsersAction.js";
import { GetOneUserAction, IGetOneUserAction } from "./GetOneUserAction.js";
import { GetUserByIdAction, IGetUserByIdAction } from "./GetUserByIdAction.js";
import { ILoginUserAction, LoginUserAction } from "./LoginUserAction.js";
import { IRemoveUserAction, RemoveUserAction } from "./RemoveUserAction.js";
import { ISaveUserAction, SaveUserAction } from "./SaveUserAction.js";
import { ISaveFcmTokenAction, SaveFcmTokenAction } from "./SaveFcmTokenAction.js";
import { IGetMetricsAction, GetMetricsAction } from "./GetMetricsAction.js";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository.js";
import {
  IGetUserByUsernameAction,
  GetUserByUsernameAction,
} from "./GetUserByUsernameAction.js";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository.js";
import {
  ILinkSubscriptionAction,
  LinkSubscriptionAction,
} from "./LinkSubscriptionAction.js";
import {
  IRefreshTokenAction,
  RefreshTokenAction,
} from "./RefreshTokenAction.js";
import { IRefreshTokenRepository } from "../repository/IRefreshTokenRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";

export interface IUserActions {
  save: ISaveUserAction;
  edit: IEditUserAction;
  remove: IRemoveUserAction;
  getAll: IGetAllUsersAction;
  getOne: IGetOneUserAction;
  getById: IGetUserByIdAction;
  login: ILoginUserAction;
  refreshToken: IRefreshTokenAction;
  saveFcmToken: ISaveFcmTokenAction;
  getMetrics: IGetMetricsAction;
  getByUsername: IGetUserByUsernameAction;
  linkSubscription: ILinkSubscriptionAction;
}
export const getUserActions = (
  UserRepository: IUserRepository,
  hashService: IHashService,
  refreshTokenRepository: IRefreshTokenRepository,
  merchantsRepository: IMerchantRepository,
  notificationsRepository: IPushNotificationRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  paymentRepository: IPaymentRepository
) => {
  const UserActions: IUserActions = {
    save: SaveUserAction(UserRepository, hashService),
    edit: EditUserAction(UserRepository, hashService, subscriptionPlanRepository),
    remove: RemoveUserAction(UserRepository),
    getAll: GetAllUsersAction(UserRepository),
    getById: GetUserByIdAction(UserRepository),
    getOne: GetOneUserAction(UserRepository),
    login: LoginUserAction(UserRepository, hashService, refreshTokenRepository),
    refreshToken: RefreshTokenAction(refreshTokenRepository, UserRepository),
    saveFcmToken: SaveFcmTokenAction(UserRepository),
    getMetrics: GetMetricsAction(
      UserRepository,
      merchantsRepository,
      notificationsRepository
    ),
    getByUsername: GetUserByUsernameAction(
      UserRepository,
      subscriptionPlanRepository,
      paymentRepository
    ),
    linkSubscription: LinkSubscriptionAction(
      UserRepository,
      subscriptionPlanRepository,
      paymentRepository
    ),
  };
  return UserActions;
};
