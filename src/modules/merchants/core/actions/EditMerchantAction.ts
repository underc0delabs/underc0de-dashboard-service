import IMerchant from "../entities/IMerchant.js";
import { IMerchantRepository } from "../repository/IMerchantRepository.js";
import { IFileStorageService } from "../../infrastructure/services/FileStorageService.js";
import MerchantModel from "../../infrastructure/models/MerchantModel.js";
import { normalizeMerchantPayload } from "../normalizeMerchantPayload.js";

const parseBoolean = (value: unknown): boolean =>
  value === true ||
  value === 1 ||
  String(value).trim().toLowerCase() === "true";

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
          const currentMerchant = await MerchantModel.findByPk(id);
          let oldLogoPath: string | null = null;

          if (currentMerchant) {
            const merchantData = currentMerchant.toJSON
              ? currentMerchant.toJSON()
              : currentMerchant;
            oldLogoPath = merchantData.logo || null;
          }

          const removeLogo = parseBoolean(
            (body as unknown as Record<string, unknown>).removeLogo,
          );
          let logoPath: string | null | undefined = undefined;

          if (removeLogo) {
            logoPath = null;
            if (oldLogoPath) {
              await FileStorageService.deleteFile(oldLogoPath);
            }
          } else if (file) {
            logoPath = await FileStorageService.saveFile(file, "logos");
            if (oldLogoPath) {
              await FileStorageService.deleteFile(oldLogoPath);
            }
          }

          const merchantData = normalizeMerchantPayload({
            ...body,
          }) as Record<string, unknown>;
          delete merchantData.removeLogo;

          if (logoPath !== undefined) {
            merchantData.logo = logoPath;
          } else {
            delete merchantData.logo;
          }

          await MerchantRepository.edit(merchantData as unknown as IMerchant, id);
          const result = await MerchantRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
