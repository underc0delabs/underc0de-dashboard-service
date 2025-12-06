import { IPushNotificationRepository } from "../repository/IPushNotificationRepository";
import { EditPushNotificationAction, IEditPushNotificationAction } from "./EditPushNotificationAction";
import { GetAllPushNotificationsAction, IGetAllPushNotificationsAction } from "./GetAllPushNotificationsAction";
import { GetOnePushNotificationAction, IGetOnePushNotificationAction } from "./GetOnePushNotificationAction";
import { GetPushNotificationByIdAction, IGetPushNotificationByIdAction } from "./GetPushNotificationByIdAction";
import { IRemovePushNotificationAction, RemovePushNotificationAction } from "./RemovePushNotificationAction";
import { ISavePushNotificationAction, SavePushNotificationAction } from "./SavePushNotificationAction";

export interface IPushNotificationActions {
  save: ISavePushNotificationAction;
  edit: IEditPushNotificationAction;
  remove: IRemovePushNotificationAction;
  getAll: IGetAllPushNotificationsAction;
  getOne: IGetOnePushNotificationAction;
  getById: IGetPushNotificationByIdAction;
}
export const getPushNotificationActions = (
  PushNotificationRepository: IPushNotificationRepository
) => {
  const PushNotificationActions: IPushNotificationActions = {
    save: SavePushNotificationAction(PushNotificationRepository),
    edit: EditPushNotificationAction(PushNotificationRepository),
    remove: RemovePushNotificationAction(PushNotificationRepository),
    getAll: GetAllPushNotificationsAction(PushNotificationRepository),
    getById: GetPushNotificationByIdAction(PushNotificationRepository),
    getOne: GetOnePushNotificationAction(PushNotificationRepository),
  };
  return PushNotificationActions;
};

