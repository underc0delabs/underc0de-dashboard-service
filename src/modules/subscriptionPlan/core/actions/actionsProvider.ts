import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";
import { EditSubscriptionPlanAction, IEditSubscriptionPlanAction } from "./EditSubscriptionPlanAction";
import { GetAllSubscriptionPlansAction, IGetAllSubscriptionPlansAction } from "./GetAllSubscriptionPlansAction";
import { GetOneSubscriptionPlanAction, IGetOneSubscriptionPlanAction } from "./GetOneSubscriptionPlanAction";
import { GetSubscriptionPlanByIdAction, IGetSubscriptionPlanByIdAction } from "./GetSubscriptionPlanByIdAction";
import { IRemoveSubscriptionPlanAction, RemoveSubscriptionPlanAction } from "./RemoveSubscriptionPlanAction";
import { ISaveSubscriptionPlanAction, SaveSubscriptionPlanAction } from "./SaveSubscriptionPlanAction";
import { ISyncMercadoPagoSubscriptionsAction, SyncMercadoPagoSubscriptionsAction } from "./SyncMercadoPagoSubscriptionsAction";
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository";

export interface ISubscriptionPlanActions {
  save: ISaveSubscriptionPlanAction;
  edit: IEditSubscriptionPlanAction;
  remove: IRemoveSubscriptionPlanAction;
  getAll: IGetAllSubscriptionPlansAction;
  getOne: IGetOneSubscriptionPlanAction;
  getById: IGetSubscriptionPlanByIdAction;
  syncMercadoPago: ISyncMercadoPagoSubscriptionsAction;
}
export const getSubscriptionPlanActions = (
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  mercadoPagoSyncService: MercadoPagoSyncService,
  paymentRepository: IPaymentRepository,
  userRepository: IUserRepository
) => {
  const SubscriptionPlanActions: ISubscriptionPlanActions = {
    save: SaveSubscriptionPlanAction(SubscriptionPlanRepository),
    edit: EditSubscriptionPlanAction(SubscriptionPlanRepository),
    remove: RemoveSubscriptionPlanAction(SubscriptionPlanRepository),
    getAll: GetAllSubscriptionPlansAction(SubscriptionPlanRepository),
    getById: GetSubscriptionPlanByIdAction(SubscriptionPlanRepository),
    getOne: GetOneSubscriptionPlanAction(SubscriptionPlanRepository),
    syncMercadoPago: SyncMercadoPagoSubscriptionsAction(
      mercadoPagoSyncService,
      SubscriptionPlanRepository,
      paymentRepository,
      userRepository
    ),
  };
  return SubscriptionPlanActions;
};

