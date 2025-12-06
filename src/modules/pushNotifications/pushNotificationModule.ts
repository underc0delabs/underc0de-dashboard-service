import { DependencyManager } from "../../dependencyManager";
import { PushNotificationRepository } from "./infrastructure/repository/PushNotificationRepository";

export const PushNotificationModuleInitializer = (dependencyManager: DependencyManager) => {
    const pushNotificationRepository = PushNotificationRepository()
    dependencyManager.register('pushNotificationRepository', pushNotificationRepository)
}

