import { IPaymentRepository } from "../repository/IPaymentRepository.js";
import { EditPaymentAction, IEditPaymentAction } from "./EditPaymentAction.js";
import { GetAllPaymentsAction, IGetAllPaymentsAction } from "./GetAllPaymentsAction.js";
import { GetOnePaymentAction, IGetOnePaymentAction } from "./GetOnePaymentAction.js";
import { GetPaymentByIdAction, IGetPaymentByIdAction } from "./GetPaymentByIdAction.js";
import { IRemovePaymentAction, RemovePaymentAction } from "./RemovePaymentAction.js";
import { ISavePaymentAction, SavePaymentAction } from "./SavePaymentAction.js";

export interface IPaymentActions {
  save: ISavePaymentAction;
  edit: IEditPaymentAction;
  remove: IRemovePaymentAction;
  getAll: IGetAllPaymentsAction;
  getOne: IGetOnePaymentAction;
  getById: IGetPaymentByIdAction;
}
export const getPaymentActions = (
  PaymentRepository: IPaymentRepository
) => {
  const PaymentActions: IPaymentActions = {
    save: SavePaymentAction(PaymentRepository),
    edit: EditPaymentAction(PaymentRepository),
    remove: RemovePaymentAction(PaymentRepository),
    getAll: GetAllPaymentsAction(PaymentRepository),
    getById: GetPaymentByIdAction(PaymentRepository),
    getOne: GetOnePaymentAction(PaymentRepository),
  };
  return PaymentActions;
};

