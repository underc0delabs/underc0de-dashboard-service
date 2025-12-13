import { DependencyManager } from "../../dependencyManager";
import { MerchantRepository } from "./infrastructure/repository/MerchantRepository";
import { FileStorageService } from "./infrastructure/services/FileStorageService";

export const MerchantModuleInitializer = (dependencyManager: DependencyManager) => {
    const merchantRepository = MerchantRepository()
    const fileStorageService = FileStorageService()
    dependencyManager.register('merchantRepository', merchantRepository)
    dependencyManager.register('fileStorageService', fileStorageService)
}

