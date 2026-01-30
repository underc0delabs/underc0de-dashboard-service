import { DependencyManager } from "../../../../dependencyManager.js"
import { getPaymentActions } from "../../core/actions/actionsProvider.js"
import { IPaymentRepository } from "../../core/repository/IPaymentRepository.js"
import { PaymentControllers } from "./PaymentControllers.js"


export const getPaymentControllers = (dependencyManager: DependencyManager) => {
    const PaymentRepository = getPaymentRepository(dependencyManager)
    const PaymentActions= getPaymentActions(PaymentRepository)
    return PaymentControllers(PaymentActions)
}

const getPaymentRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('paymentRepository') as IPaymentRepository
}

