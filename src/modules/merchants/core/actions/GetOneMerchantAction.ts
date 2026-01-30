import { IMerchantRepository } from "../repository/IMerchantRepository.js";
export interface IGetOneMerchantAction {
    execute: (query:object) => Promise<any>
}
export const GetOneMerchantAction = (MerchantRepository: IMerchantRepository):IGetOneMerchantAction => {
    return {
        execute(query) {
          return new Promise(async (resolve, reject) => {
            try {
              const merchant = await MerchantRepository.getOne(query)
              resolve(merchant)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

