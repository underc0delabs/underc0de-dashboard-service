import { IMerchantRepository } from "../repository/IMerchantRepository";
import { EditMerchantAction, IEditMerchantAction } from "./EditMerchantAction";
import { GetAllMerchantsAction, IGetAllMerchantsAction } from "./GetAllMerchantsAction";
import { GetOneMerchantAction, IGetOneMerchantAction } from "./GetOneMerchantAction";
import { GetMerchantByIdAction, IGetMerchantByIdAction } from "./GetMerchantByIdAction";
import { IRemoveMerchantAction, RemoveMerchantAction } from "./RemoveMerchantAction";
import { ISaveMerchantAction, SaveMerchantAction } from "./SaveMerchantAction";
import { IFileStorageService } from "../../infrastructure/services/FileStorageService";

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

