import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";
import { EditSubscriptionPlanAction, IEditSubscriptionPlanAction } from "./EditSubscriptionPlanAction";
import { GetAllSubscriptionPlansAction, IGetAllSubscriptionPlansAction } from "./GetAllSubscriptionPlansAction";
import { GetOneSubscriptionPlanAction, IGetOneSubscriptionPlanAction } from "./GetOneSubscriptionPlanAction";
import { GetSubscriptionPlanByIdAction, IGetSubscriptionPlanByIdAction } from "./GetSubscriptionPlanByIdAction";
import { IRemoveSubscriptionPlanAction, RemoveSubscriptionPlanAction } from "./RemoveSubscriptionPlanAction";
import { ISaveSubscriptionPlanAction, SaveSubscriptionPlanAction } from "./SaveSubscriptionPlanAction";

export interface ISubscriptionPlanActions {
  save: ISaveSubscriptionPlanAction;
  edit: IEditSubscriptionPlanAction;
  remove: IRemoveSubscriptionPlanAction;
  getAll: IGetAllSubscriptionPlansAction;
  getOne: IGetOneSubscriptionPlanAction;
  getById: IGetSubscriptionPlanByIdAction;
}
export const getSubscriptionPlanActions = (
  SubscriptionPlanRepository: ISubscriptionPlanRepository
) => {
  const SubscriptionPlanActions: ISubscriptionPlanActions = {
    save: SaveSubscriptionPlanAction(SubscriptionPlanRepository),
    edit: EditSubscriptionPlanAction(SubscriptionPlanRepository),
    remove: RemoveSubscriptionPlanAction(SubscriptionPlanRepository),
    getAll: GetAllSubscriptionPlansAction(SubscriptionPlanRepository),
    getById: GetSubscriptionPlanByIdAction(SubscriptionPlanRepository),
    getOne: GetOneSubscriptionPlanAction(SubscriptionPlanRepository),
  };
  return SubscriptionPlanActions;
};

