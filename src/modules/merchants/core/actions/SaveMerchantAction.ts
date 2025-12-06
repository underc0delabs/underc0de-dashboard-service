import IMerchant from "../entities/IMerchant";
import { IMerchantRepository } from "../repository/IMerchantRepository";

export interface ISaveMerchantAction {
  execute: (body: IMerchant) => Promise<any>;
}

export const SaveMerchantAction = (
  MerchantRepository: IMerchantRepository
): ISaveMerchantAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await MerchantRepository.save(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

