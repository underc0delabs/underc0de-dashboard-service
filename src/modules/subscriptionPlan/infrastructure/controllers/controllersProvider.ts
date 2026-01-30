import { DependencyManager } from "../../../../dependencyManager.js"
import { getSubscriptionPlanActions } from "../../core/actions/actionsProvider.js"
import { ISubscriptionPlanRepository } from "../../core/repository/ISubscriptionPlanRepository.js"
import { SubscriptionPlanControllers } from "./SubscriptionPlanControllers.js"
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js"
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js"


export const getSubscriptionPlanControllers = (dependencyManager: DependencyManager) => {
    const SubscriptionPlanRepository = getSubscriptionPlanRepository(dependencyManager)
    const mercadoPagoSyncService = getMercadoPagoSyncService(dependencyManager)
    const paymentRepository = getPaymentRepository(dependencyManager)
    const userRepository = getUserRepository(dependencyManager)
    const SubscriptionPlanActions= getSubscriptionPlanActions(
        SubscriptionPlanRepository,
        mercadoPagoSyncService,
        paymentRepository,
        userRepository
    )
    return SubscriptionPlanControllers(SubscriptionPlanActions)
}

const getSubscriptionPlanRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('subscriptionPlanRepository') as ISubscriptionPlanRepository
}

const getMercadoPagoSyncService = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('mercadoPagoSyncService') as MercadoPagoSyncService
}

const getPaymentRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('paymentRepository') as IPaymentRepository
}

const getUserRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('userRepository') as IUserRepository
}