import { DependencyManager } from "../../../../dependencyManager"
import { getPaymentActions } from "../../core/actions/actionsProvider"
import { IPaymentRepository } from "../../core/repository/IPaymentRepository"
import { PaymentControllers } from "./PaymentControllers"


export const getPaymentControllers = (dependencyManager: DependencyManager) => {
    const PaymentRepository = getPaymentRepository(dependencyManager)
    const PaymentActions= getPaymentActions(PaymentRepository)
    return PaymentControllers(PaymentActions)
}

const getPaymentRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('paymentRepository') as IPaymentRepository
}

