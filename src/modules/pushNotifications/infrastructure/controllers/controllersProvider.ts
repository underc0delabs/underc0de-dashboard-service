import { DependencyManager } from "../../../../dependencyManager.js"
import { getPushNotificationActions } from "../../core/actions/actionsProvider.js"
import { IPushNotificationRepository } from "../../core/repository/IPushNotificationRepository.js"
import { PushNotificationControllers } from "./PushNotificationControllers.js"
import { IFirebaseService } from "../../../../services/pushNotificationService/core/iFirebaseService.js"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js"


export const getPushNotificationControllers = (dependencyManager: DependencyManager) => {
    const PushNotificationRepository = getPushNotificationRepository(dependencyManager)
    const firebaseNotificationService = getFirebaseNotificationService(dependencyManager)
    const userRepository = getUserRepository(dependencyManager)
    const PushNotificationActions= getPushNotificationActions(PushNotificationRepository, firebaseNotificationService, userRepository)
    return PushNotificationControllers(PushNotificationActions)
}

const getPushNotificationRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('pushNotificationRepository') as IPushNotificationRepository
}

const getFirebaseNotificationService = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('pushNotificationService') as IFirebaseService
}

const getUserRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('userRepository') as IUserRepository
}
