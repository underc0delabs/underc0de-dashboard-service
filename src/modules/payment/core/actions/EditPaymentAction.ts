import IPayment from "../entities/IPayment.js";
import { IPaymentRepository } from "../repository/IPaymentRepository.js";

export interface IEditPaymentAction {
  execute: (body: IPayment, id: string) => Promise<any>;
}
export const EditPaymentAction = (
  PaymentRepository: IPaymentRepository
): IEditPaymentAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          await PaymentRepository.edit(body, id);
          const result = await PaymentRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

