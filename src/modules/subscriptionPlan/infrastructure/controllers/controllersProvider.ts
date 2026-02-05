import { DependencyManager } from "../../../../dependencyManager.js"
import { getSubscriptionPlanActions } from "../../core/actions/actionsProvider.js"
import { ISubscriptionPlanRepository } from "../../core/repository/ISubscriptionPlanRepository.js"
import { SubscriptionPlanControllers } from "./SubscriptionPlanControllers.js"
import { MercadoPagoSyncService } from "../../../../services/mercadopagoService/core/service/mercadoPagoSyncService.js"
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js"
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js"
import { IEnvironmentRepository } from "../../../environments/core/repository/IEnvironmentRepository.js"

export const getSubscriptionPlanControllers = (dependencyManager: DependencyManager) => {
    const SubscriptionPlanRepository = getSubscriptionPlanRepository(dependencyManager)
    const mercadoPagoSyncService = getMercadoPagoSyncService(dependencyManager)
    const paymentRepository = getPaymentRepository(dependencyManager)
    const userRepository = getUserRepository(dependencyManager)
    const mercadoPagoGateway = getMercadoPagoGateway(dependencyManager)
    const environmentRepository = getEnvironmentRepository(dependencyManager)
    const SubscriptionPlanActions= getSubscriptionPlanActions(
        SubscriptionPlanRepository,
        mercadoPagoSyncService,
        paymentRepository,
        userRepository,
        mercadoPagoGateway,
        environmentRepository
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

const getMercadoPagoGateway = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('mercadoPagoGateway') as MercadoPagoGateway
}

const getEnvironmentRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('environmentRepository') as IEnvironmentRepository
}