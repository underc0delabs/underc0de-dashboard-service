import { DependencyManager } from "../../dependencyManager.js";
import { MerchantRepository } from "./infrastructure/repository/MerchantRepository.js";
import { FileStorageService } from "./infrastructure/services/FileStorageService.js";

export const MerchantModuleInitializer = (dependencyManager: DependencyManager) => {
    const merchantRepository = MerchantRepository()
    const fileStorageService = FileStorageService()
    dependencyManager.register('merchantRepository', merchantRepository)
    dependencyManager.register('fileStorageService', fileStorageService)
}

