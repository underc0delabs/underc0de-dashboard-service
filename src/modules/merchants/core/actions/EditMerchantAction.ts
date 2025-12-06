import IMerchant from "../entities/IMerchant";
import { IMerchantRepository } from "../repository/IMerchantRepository";

export interface IEditMerchantAction {
  execute: (body: IMerchant, id: string) => Promise<any>;
}
export const EditMerchantAction = (
  MerchantRepository: IMerchantRepository
): IEditMerchantAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          await MerchantRepository.edit(body, id);
          const result = await MerchantRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

