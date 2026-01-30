import { IPaymentRepository } from "../repository/IPaymentRepository.js";
export interface IGetOnePaymentAction {
    execute: (query:object) => Promise<any>
}
export const GetOnePaymentAction = (PaymentRepository: IPaymentRepository):IGetOnePaymentAction => {
    return {
        execute(query) {
          return new Promise(async (resolve, reject) => {
            try {
              const payment = await PaymentRepository.getOne(query)
              resolve(payment)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

