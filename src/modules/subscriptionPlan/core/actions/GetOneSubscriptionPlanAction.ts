import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
export interface IGetOneSubscriptionPlanAction {
    execute: (query:object) => Promise<any>
}
export const GetOneSubscriptionPlanAction = (SubscriptionPlanRepository: ISubscriptionPlanRepository):IGetOneSubscriptionPlanAction => {
    return {
        execute(query) {
          return new Promise(async (resolve, reject) => {
            try {
              const subscriptionPlan = await SubscriptionPlanRepository.getOne(query)
              resolve(subscriptionPlan)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

