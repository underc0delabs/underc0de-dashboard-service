import { DependencyManager } from "../../dependencyManager";
import { PaymentRepository } from "./infrastructure/repository/PaymentRepository";

export const PaymentModuleInitializer = (dependencyManager: DependencyManager) => {
    const paymentRepository = PaymentRepository()
    dependencyManager.register('paymentRepository', paymentRepository)
}

