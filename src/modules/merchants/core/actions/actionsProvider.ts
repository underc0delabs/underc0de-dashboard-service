import { IMerchantRepository } from "../repository/IMerchantRepository";
import { EditMerchantAction, IEditMerchantAction } from "./EditMerchantAction";
import { GetAllMerchantsAction, IGetAllMerchantsAction } from "./GetAllMerchantsAction";
import { GetOneMerchantAction, IGetOneMerchantAction } from "./GetOneMerchantAction";
import { GetMerchantByIdAction, IGetMerchantByIdAction } from "./GetMerchantByIdAction";
import { IRemoveMerchantAction, RemoveMerchantAction } from "./RemoveMerchantAction";
import { ISaveMerchantAction, SaveMerchantAction } from "./SaveMerchantAction";

export interface IMerchantActions {
  save: ISaveMerchantAction;
  edit: IEditMerchantAction;
  remove: IRemoveMerchantAction;
  getAll: IGetAllMerchantsAction;
  getOne: IGetOneMerchantAction;
  getById: IGetMerchantByIdAction;
}
export const getMerchantActions = (
  MerchantRepository: IMerchantRepository
) => {
  const MerchantActions: IMerchantActions = {
    save: SaveMerchantAction(MerchantRepository),
    edit: EditMerchantAction(MerchantRepository),
    remove: RemoveMerchantAction(MerchantRepository),
    getAll: GetAllMerchantsAction(MerchantRepository),
    getById: GetMerchantByIdAction(MerchantRepository),
    getOne: GetOneMerchantAction(MerchantRepository),
  };
  return MerchantActions;
};

