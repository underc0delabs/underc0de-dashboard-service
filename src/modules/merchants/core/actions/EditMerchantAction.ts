import IMerchant from "../entities/IMerchant";
import { IMerchantRepository } from "../repository/IMerchantRepository";
import { IFileStorageService } from "../../infrastructure/services/FileStorageService";
import MerchantModel from "../../infrastructure/models/MerchantModel";

export interface IEditMerchantAction {
  execute: (body: IMerchant, id: string, file?: Express.Multer.File) => Promise<any>;
}
export const EditMerchantAction = (
  MerchantRepository: IMerchantRepository,
  FileStorageService: IFileStorageService
): IEditMerchantAction => {
  return {
    execute(body, id, file) {
      return new Promise(async (resolve, reject) => {
        try {
          // Obtener el merchant actual directamente del modelo para obtener la ruta relativa original
          const currentMerchant = await MerchantModel.findByPk(id);
          let oldLogoPath: string | null = null;
          
          if (currentMerchant) {
            const merchantData = currentMerchant.toJSON ? currentMerchant.toJSON() : currentMerchant;
            oldLogoPath = merchantData.logo || null;
          }
          
          let logoPath = body.logo;          
          if (file) {
            logoPath = await FileStorageService.saveFile(file, 'logos');            
            if (oldLogoPath) {
              await FileStorageService.deleteFile(oldLogoPath);
            }
          }
          
          const merchantData = {
            ...body,
            logo: logoPath,
          };
          
          await MerchantRepository.edit(merchantData, id);
          const result = await MerchantRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

