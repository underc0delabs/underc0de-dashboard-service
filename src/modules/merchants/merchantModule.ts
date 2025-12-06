import { DependencyManager } from "../../dependencyManager";
import { MerchantRepository } from "./infrastructure/repository/MerchantRepository";

export const MerchantModuleInitializer = (dependencyManager: DependencyManager) => {
    const merchantRepository = MerchantRepository()
    dependencyManager.register('merchantRepository', merchantRepository)
}

