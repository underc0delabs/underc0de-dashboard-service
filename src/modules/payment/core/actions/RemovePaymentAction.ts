import { IPaymentRepository } from "../repository/IPaymentRepository";
import { PaymentNotExistException } from "../exceptions/PaymentNotExistException";
import { InvalidIdException } from "../exceptions/InvalidIdException";

export interface IRemovePaymentAction {
    execute: (id:string) => Promise<any>
}

export const RemovePaymentAction = (PaymentRepository: IPaymentRepository):IRemovePaymentAction => {
    return {
        execute(id) {
            return new Promise(async (resolve, reject) => {
                try {
                  const payment = await PaymentRepository.getById(id)
                  if (!payment) throw new PaymentNotExistException()
                  await PaymentRepository.remove(id)
                  resolve(payment)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

