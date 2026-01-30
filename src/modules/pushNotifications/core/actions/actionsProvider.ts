import { IFirebaseService } from "../../../../services/pushNotificationService/core/iFirebaseService.js";
import { IPushNotificationRepository } from "../repository/IPushNotificationRepository.js";
import { EditPushNotificationAction, IEditPushNotificationAction } from "./EditPushNotificationAction.js";
import { GetAllPushNotificationsAction, IGetAllPushNotificationsAction } from "./GetAllPushNotificationsAction.js";
import { GetOnePushNotificationAction, IGetOnePushNotificationAction } from "./GetOnePushNotificationAction.js";
import { GetPushNotificationByIdAction, IGetPushNotificationByIdAction } from "./GetPushNotificationByIdAction.js";
import { IRemovePushNotificationAction, RemovePushNotificationAction } from "./RemovePushNotificationAction.js";
import { ISavePushNotificationAction, SavePushNotificationAction } from "./SavePushNotificationAction.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

export interface IPushNotificationActions {
  save: ISavePushNotificationAction;
  edit: IEditPushNotificationAction;
  remove: IRemovePushNotificationAction;
  getAll: IGetAllPushNotificationsAction;
  getOne: IGetOnePushNotificationAction;
  getById: IGetPushNotificationByIdAction;
}
export const getPushNotificationActions = (
  PushNotificationRepository: IPushNotificationRepository,
  firebaseNotificationService: IFirebaseService,
  userRepository: IUserRepository
) => {
  const PushNotificationActions: IPushNotificationActions = {
    save: SavePushNotificationAction(PushNotificationRepository, firebaseNotificationService, userRepository),
    edit: EditPushNotificationAction(PushNotificationRepository),
    remove: RemovePushNotificationAction(PushNotificationRepository),
    getAll: GetAllPushNotificationsAction(PushNotificationRepository),
    getById: GetPushNotificationByIdAction(PushNotificationRepository),
    getOne: GetOnePushNotificationAction(PushNotificationRepository),
  };
  return PushNotificationActions;
};

