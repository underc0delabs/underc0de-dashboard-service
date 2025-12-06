import { ISubscriptionPlanRepository } from "../repository/ISubscriptionPlanRepository";
import { SubscriptionPlanNotExistException } from "../exceptions/SubscriptionPlanNotExistException";
import { InvalidIdException } from "../exceptions/InvalidIdException";

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

