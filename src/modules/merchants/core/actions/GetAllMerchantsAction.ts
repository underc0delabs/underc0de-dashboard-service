import { IMerchantRepository } from "../repository/IMerchantRepository";
export interface IGetAllMerchantsAction {
    execute: (query:any) => Promise<any>
}
export const GetAllMerchantsAction = (MerchantRepository: IMerchantRepository):IGetAllMerchantsAction => {
    return {
        execute(query) {
            return new Promise(async (resolve, reject) => {
                try {
                  const merchants = await MerchantRepository.get(query)
                  resolve(merchants)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

