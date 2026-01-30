import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { EditSubscriptionPlanAction, IEditSubscriptionPlanAction } from "./EditSubscriptionPlanAction.js";
import { GetAllSubscriptionPlansAction, IGetAllSubscriptionPlansAction } from "./GetAllSubscriptionPlansAction.js";
import { GetOneSubscriptionPlanAction, IGetOneSubscriptionPlanAction } from "./GetOneSubscriptionPlanAction.js";
import { GetSubscriptionPlanByIdAction, IGetSubscriptionPlanByIdAction } from "./GetSubscriptionPlanByIdAction.js";
import { IRemoveSubscriptionPlanAction, RemoveSubscriptionPlanAction } from "./RemoveSubscriptionPlanAction.js";
import { ISaveSubscriptionPlanAction, SaveSubscriptionPlanAction } from "./SaveSubscriptionPlanAction.js";
import { ISyncMercadoPagoSubscriptionsAction, SyncMercadoPagoSubscriptionsAction } from "./SyncMercadoPagoSubscriptionsAction.js";
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

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

