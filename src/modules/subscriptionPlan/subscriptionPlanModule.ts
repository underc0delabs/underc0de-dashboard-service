import { DependencyManager } from "../../dependencyManager";
import { SubscriptionPlanRepository } from "./infrastructure/repository/SubscriptionPlanRepository";

export const SubscriptionPlanModuleInitializer = (dependencyManager: DependencyManager) => {
    const subscriptionPlanRepository = SubscriptionPlanRepository()
    dependencyManager.register('subscriptionPlanRepository', subscriptionPlanRepository)
}

