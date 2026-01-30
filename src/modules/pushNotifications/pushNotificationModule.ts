import { DependencyManager } from "../../dependencyManager.js";
import { PushNotificationRepository } from "./infrastructure/repository/PushNotificationRepository.js";

export const PushNotificationModuleInitializer = (dependencyManager: DependencyManager) => {
    const pushNotificationRepository = PushNotificationRepository()
    dependencyManager.register('pushNotificationRepository', pushNotificationRepository)
}

