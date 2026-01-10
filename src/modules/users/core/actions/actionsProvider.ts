import { IUserRepository } from "../repository/IMongoUserRepository";
import { IHashService } from "../services/IHashService";
import { EditUserAction, IEditUserAction } from "./EditUserAction";
import { GetAllUsersAction, IGetAllUsersAction } from "./GetAllUsersAction";
import { GetOneUserAction, IGetOneUserAction } from "./GetOneUserAction";
import { GetUserByIdAction, IGetUserByIdAction } from "./GetUserByIdAction";
import { ILoginUserAction, LoginUserAction } from "./LoginUserAction";
import { IRemoveUserAction, RemoveUserAction } from "./RemoveUserAction";
import { ISaveUserAction, SaveUserAction } from "./SaveUserAction";
import { ISaveFcmTokenAction, SaveFcmTokenAction } from "./SaveFcmTokenAction";
import { IGetMetricsAction, GetMetricsAction } from "./GetMetricsAction";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository";
import {
  IGetUserByUsernameAction,
  GetUserByUsernameAction,
} from "./GetUserByUsernameAction";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository";
import {
  ILinkSubscriptionAction,
  LinkSubscriptionAction,
} from "./LinkSubscriptionAction";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository";
export interface IUserActions {
  save: ISaveUserAction;
  edit: IEditUserAction;
  remove: IRemoveUserAction;
  getAll: IGetAllUsersAction;
  getOne: IGetOneUserAction;
  getById: IGetUserByIdAction;
  login: ILoginUserAction;
  saveFcmToken: ISaveFcmTokenAction;
  getMetrics: IGetMetricsAction;
  getByUsername: IGetUserByUsernameAction;
  linkSubscription: ILinkSubscriptionAction;
}
export const getUserActions = (
  UserRepository: IUserRepository,
  hashService: IHashService,
  merchantsRepository: IMerchantRepository,
  notificationsRepository: IPushNotificationRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  paymentRepository: IPaymentRepository
) => {
  const UserActions: IUserActions = {
    save: SaveUserAction(UserRepository, hashService),
    edit: EditUserAction(UserRepository, hashService),
    remove: RemoveUserAction(UserRepository),
    getAll: GetAllUsersAction(UserRepository),
    getById: GetUserByIdAction(UserRepository),
    getOne: GetOneUserAction(UserRepository),
    login: LoginUserAction(UserRepository, hashService),
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
