import ISubscriptionPlan from "../entities/ISubscriptionPlan.js";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";

export interface IEditSubscriptionPlanAction {
  execute: (body: ISubscriptionPlan, id: string) => Promise<any>;
}
export const EditSubscriptionPlanAction = (
  SubscriptionPlanRepository: ISubscriptionPlanRepository
): IEditSubscriptionPlanAction => {
  return {
    execute(body, id) {
      return new Promise(async (resolve, reject) => {
        try {
          await SubscriptionPlanRepository.edit(body, id);
          const result = await SubscriptionPlanRepository.getById(id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

