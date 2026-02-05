import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import {
  EditSubscriptionPlanAction,
  IEditSubscriptionPlanAction,
} from "./EditSubscriptionPlanAction.js";
import {
  GetAllSubscriptionPlansAction,
  IGetAllSubscriptionPlansAction,
} from "./GetAllSubscriptionPlansAction.js";
import {
  GetOneSubscriptionPlanAction,
  IGetOneSubscriptionPlanAction,
} from "./GetOneSubscriptionPlanAction.js";
import {
  GetSubscriptionPlanByIdAction,
  IGetSubscriptionPlanByIdAction,
} from "./GetSubscriptionPlanByIdAction.js";
import {
  IRemoveSubscriptionPlanAction,
  RemoveSubscriptionPlanAction,
} from "./RemoveSubscriptionPlanAction.js";
import {
  ISaveSubscriptionPlanAction,
  SaveSubscriptionPlanAction,
} from "./SaveSubscriptionPlanAction.js";
import {
  ISyncMercadoPagoSubscriptionsAction,
  SyncMercadoPagoSubscriptionsAction,
} from "./SyncMercadoPagoSubscriptionsAction.js";
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import {
  CreateSubscriptionAction,
  ICreateSubscriptionAction,
} from "./CreateSubscriptionAction.js";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import {
  IConfirmSubscriptionAction,
  ConfirmSubscriptionAction,
} from "./ConfirmSubscriptionAction.js";
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js";

export interface ISubscriptionPlanActions {
  save: ISaveSubscriptionPlanAction;
  edit: IEditSubscriptionPlanAction;
  remove: IRemoveSubscriptionPlanAction;
  getAll: IGetAllSubscriptionPlansAction;
  getOne: IGetOneSubscriptionPlanAction;
  getById: IGetSubscriptionPlanByIdAction;
  syncMercadoPago: ISyncMercadoPagoSubscriptionsAction;
  createSubscription: ICreateSubscriptionAction;
  confirmSubscription: IConfirmSubscriptionAction;
}
export const getSubscriptionPlanActions = (
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  mercadoPagoSyncService: MercadoPagoSyncService,
  paymentRepository: IPaymentRepository,
  userRepository: IUserRepository,
  mercadoPagoGateway: MercadoPagoGateway,
  environmentRepository: IEnvironmentRepository,
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
      userRepository,
    ),
    createSubscription: CreateSubscriptionAction(
      mercadoPagoGateway,
      SubscriptionPlanRepository,
      userRepository,
      environmentRepository,
    ),
    confirmSubscription: ConfirmSubscriptionAction(
      userRepository,
      SubscriptionPlanRepository,
    ),
  };
  return SubscriptionPlanActions;
};
