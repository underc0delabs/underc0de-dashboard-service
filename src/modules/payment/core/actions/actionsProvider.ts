import { IPaymentRepository } from "../repository/IPaymentRepository";
import { EditPaymentAction, IEditPaymentAction } from "./EditPaymentAction";
import { GetAllPaymentsAction, IGetAllPaymentsAction } from "./GetAllPaymentsAction";
import { GetOnePaymentAction, IGetOnePaymentAction } from "./GetOnePaymentAction";
import { GetPaymentByIdAction, IGetPaymentByIdAction } from "./GetPaymentByIdAction";
import { IRemovePaymentAction, RemovePaymentAction } from "./RemovePaymentAction";
import { ISavePaymentAction, SavePaymentAction } from "./SavePaymentAction";

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

