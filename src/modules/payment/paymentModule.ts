import { DependencyManager } from "../../dependencyManager.js";
import { PaymentRepository } from "./infrastructure/repository/PaymentRepository.js";

export const PaymentModuleInitializer = (dependencyManager: DependencyManager) => {
    const paymentRepository = PaymentRepository()
    dependencyManager.register('paymentRepository', paymentRepository)
}

