import { IPaymentRepository } from "../repository/IPaymentRepository.js";
export interface IGetAllPaymentsAction {
    execute: (query:any) => Promise<any>
}
export const GetAllPaymentsAction = (PaymentRepository: IPaymentRepository):IGetAllPaymentsAction => {
    return {
        execute(query) {
            return new Promise(async (resolve, reject) => {
                try {
                  const payments = await PaymentRepository.get(query)
                  resolve(payments)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

