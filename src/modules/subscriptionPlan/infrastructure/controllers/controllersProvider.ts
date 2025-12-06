import { DependencyManager } from "../../../../dependencyManager"
import { getSubscriptionPlanActions } from "../../core/actions/actionsProvider"
import { ISubscriptionPlanRepository } from "../../core/repository/ISubscriptionPlanRepository"
import { SubscriptionPlanControllers } from "./SubscriptionPlanControllers"


export const getSubscriptionPlanControllers = (dependencyManager: DependencyManager) => {
    const SubscriptionPlanRepository = getSubscriptionPlanRepository(dependencyManager)
    const SubscriptionPlanActions= getSubscriptionPlanActions(SubscriptionPlanRepository)
    return SubscriptionPlanControllers(SubscriptionPlanActions)
}

const getSubscriptionPlanRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('subscriptionPlanRepository') as ISubscriptionPlanRepository
}

