import { PaymentNotExistException } from "../exceptions/PaymentNotExistException.js";
import { IPaymentRepository } from "../repository/IPaymentRepository.js";
export interface IGetPaymentByIdAction {
    execute: (id:string) => Promise<any>
}
export const GetPaymentByIdAction = (PaymentRepository: IPaymentRepository):IGetPaymentByIdAction => {
    return {
        execute(id) {
          return new Promise(async (resolve, reject) => {
            try {
              const payment = await PaymentRepository.getById(id)
              if(!payment) throw new PaymentNotExistException()
              resolve(payment)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

