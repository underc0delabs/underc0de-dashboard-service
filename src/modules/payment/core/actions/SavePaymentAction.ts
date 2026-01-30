import IPayment from "../entities/IPayment.js";
import { IPaymentRepository } from "../repository/IPaymentRepository.js";

export interface ISavePaymentAction {
  execute: (body: IPayment) => Promise<any>;
}

export const SavePaymentAction = (
  PaymentRepository: IPaymentRepository
): ISavePaymentAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await PaymentRepository.save(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

