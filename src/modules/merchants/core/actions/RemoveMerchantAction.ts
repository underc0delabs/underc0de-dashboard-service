import { IMerchantRepository } from "../repository/IMerchantRepository.js";
import { MerchantNotExistException } from "../exceptions/MerchantNotExistException.js";
import { InvalidIdException } from "../exceptions/InvalidIdException.js";

export interface IRemoveMerchantAction {
    execute: (id:string) => Promise<any>
}

export const RemoveMerchantAction = (MerchantRepository: IMerchantRepository):IRemoveMerchantAction => {
    return {
        execute(id) {
            return new Promise(async (resolve, reject) => {
                try {
                  const merchant = await MerchantRepository.getById(id)
                  if (!merchant) throw new MerchantNotExistException()
                  await MerchantRepository.remove(id)
                  resolve(merchant)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

