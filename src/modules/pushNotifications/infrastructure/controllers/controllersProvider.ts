import { DependencyManager } from "../../../../dependencyManager"
import { getPushNotificationActions } from "../../core/actions/actionsProvider"
import { IPushNotificationRepository } from "../../core/repository/IPushNotificationRepository"
import { PushNotificationControllers } from "./PushNotificationControllers"


export const getPushNotificationControllers = (dependencyManager: DependencyManager) => {
    const PushNotificationRepository = getPushNotificationRepository(dependencyManager)
    const PushNotificationActions= getPushNotificationActions(PushNotificationRepository)
    return PushNotificationControllers(PushNotificationActions)
}

const getPushNotificationRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('pushNotificationRepository') as IPushNotificationRepository
}

