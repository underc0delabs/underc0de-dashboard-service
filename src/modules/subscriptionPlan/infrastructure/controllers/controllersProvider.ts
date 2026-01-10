import { DependencyManager } from "../../../../dependencyManager"
import { getSubscriptionPlanActions } from "../../core/actions/actionsProvider"
import { ISubscriptionPlanRepository } from "../../core/repository/ISubscriptionPlanRepository"
import { SubscriptionPlanControllers } from "./SubscriptionPlanControllers"
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService"
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository"


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