import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";
export interface IGetAllSubscriptionPlansAction {
    execute: (query:any) => Promise<any>
}
export const GetAllSubscriptionPlansAction = (SubscriptionPlanRepository: ISubscriptionPlanRepository):IGetAllSubscriptionPlansAction => {
    return {
        execute(query) {
            return new Promise(async (resolve, reject) => {
                try {
                  const subscriptionPlans = await SubscriptionPlanRepository.get(query)
                  resolve(subscriptionPlans)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

