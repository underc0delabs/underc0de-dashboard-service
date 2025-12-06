import ISubscriptionPlan from "../entities/ISubscriptionPlan";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";

export interface ISaveSubscriptionPlanAction {
  execute: (body: ISubscriptionPlan) => Promise<any>;
}

export const SaveSubscriptionPlanAction = (
  SubscriptionPlanRepository: ISubscriptionPlanRepository
): ISaveSubscriptionPlanAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await SubscriptionPlanRepository.save(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};

