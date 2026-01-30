import { MerchantNotExistException } from "../exceptions/MerchantNotExistException.js";
import { IMerchantRepository } from "../repository/IMerchantRepository.js";
export interface IGetMerchantByIdAction {
    execute: (id:string) => Promise<any>
}
export const GetMerchantByIdAction = (MerchantRepository: IMerchantRepository):IGetMerchantByIdAction => {
    return {
        execute(id) {
          return new Promise(async (resolve, reject) => {
            try {
              const merchant = await MerchantRepository.getById(id)
              if(!merchant) throw new MerchantNotExistException()
              resolve(merchant)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

