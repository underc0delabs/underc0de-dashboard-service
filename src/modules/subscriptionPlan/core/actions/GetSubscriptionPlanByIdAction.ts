import { SubscriptionPlanNotExistException } from "../exceptions/SubscriptionPlanNotExistException";
import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";
export interface IGetSubscriptionPlanByIdAction {
    execute: (id:string) => Promise<any>
}
export const GetSubscriptionPlanByIdAction = (SubscriptionPlanRepository: ISubscriptionPlanRepository):IGetSubscriptionPlanByIdAction => {
    return {
        execute(id) {
          return new Promise(async (resolve, reject) => {
            try {
              const subscriptionPlan = await SubscriptionPlanRepository.getById(id)
              if(!subscriptionPlan) throw new SubscriptionPlanNotExistException()
              resolve(subscriptionPlan)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}

