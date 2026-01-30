import { DependencyManager } from "../../dependencyManager.js";
import { SubscriptionPlanRepository } from "./infrastructure/repository/SubscriptionPlanRepository.js";

export const SubscriptionPlanModuleInitializer = (dependencyManager: DependencyManager) => {
    const subscriptionPlanRepository = SubscriptionPlanRepository()
    dependencyManager.register('subscriptionPlanRepository', subscriptionPlanRepository)
}

