import { IMerchantRepository } from "../repository/IMerchantRepository.js";
import { EditMerchantAction, IEditMerchantAction } from "./EditMerchantAction.js";
import { GetAllMerchantsAction, IGetAllMerchantsAction } from "./GetAllMerchantsAction.js";
import { GetOneMerchantAction, IGetOneMerchantAction } from "./GetOneMerchantAction.js";
import { GetMerchantByIdAction, IGetMerchantByIdAction } from "./GetMerchantByIdAction.js";
import { IRemoveMerchantAction, RemoveMerchantAction } from "./RemoveMerchantAction.js";
import { ISaveMerchantAction, SaveMerchantAction } from "./SaveMerchantAction.js";
import { IFileStorageService } from "../../infrastructure/services/FileStorageService.js";

export interface IMerchantActions {
  save: ISaveMerchantAction;
  edit: IEditMerchantAction;
  remove: IRemoveMerchantAction;
  getAll: IGetAllMerchantsAction;
  getOne: IGetOneMerchantAction;
  getById: IGetMerchantByIdAction;
}
export const getMerchantActions = (
  MerchantRepository: IMerchantRepository,
  FileStorageService: IFileStorageService
) => {
  const MerchantActions: IMerchantActions = {
    save: SaveMerchantAction(MerchantRepository, FileStorageService),
    edit: EditMerchantAction(MerchantRepository, FileStorageService),
    remove: RemoveMerchantAction(MerchantRepository),
    getAll: GetAllMerchantsAction(MerchantRepository),
    getById: GetMerchantByIdAction(MerchantRepository),
    getOne: GetOneMerchantAction(MerchantRepository),
  };
  return MerchantActions;
};

