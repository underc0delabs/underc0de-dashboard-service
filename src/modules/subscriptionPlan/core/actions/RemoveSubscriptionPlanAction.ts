import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository.js";
import { SubscriptionPlanNotExistException } from "../exceptions/SubscriptionPlanNotExistException.js";
import { InvalidIdException } from "../exceptions/InvalidIdException.js";

export interface IRemoveSubscriptionPlanAction {
    execute: (id:string) => Promise<any>
}

export const RemoveSubscriptionPlanAction = (SubscriptionPlanRepository: ISubscriptionPlanRepository):IRemoveSubscriptionPlanAction => {
    return {
        execute(id) {
            return new Promise(async (resolve, reject) => {
                try {
                  const subscriptionPlan = await SubscriptionPlanRepository.getById(id)
                  if (!subscriptionPlan) throw new SubscriptionPlanNotExistException()
                  await SubscriptionPlanRepository.remove(id)
                  resolve(subscriptionPlan)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}

