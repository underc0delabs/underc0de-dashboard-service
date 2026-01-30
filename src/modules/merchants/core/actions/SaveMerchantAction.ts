import IMerchant from "../entities/IMerchant.js";
import { IMerchantRepository } from "../repository/IMerchantRepository.js";
import { IFileStorageService } from "../../infrastructure/services/FileStorageService.js";

export interface ISaveMerchantAction {
  execute: (body: IMerchant, file?: Express.Multer.File) => Promise<any>;
}

export const SaveMerchantAction = (
  MerchantRepository: IMerchantRepository,
  FileStorageService: IFileStorageService
): ISaveMerchantAction => {
  return {
    execute: (body, file) => {
      return new Promise(async (resolve, reject) => {
        try {
          let logoPath = body.logo;
          
          if (file) {
            logoPath = await FileStorageService.saveFile(file, 'logos');
          }
          
          const merchantData = {
            ...body,
            logo: logoPath,
          };
          
          const result = await MerchantRepository.save(merchantData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

