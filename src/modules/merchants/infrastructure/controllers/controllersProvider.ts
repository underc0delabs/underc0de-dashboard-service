import { DependencyManager } from "../../../../dependencyManager.js"
import { getMerchantActions } from "../../core/actions/actionsProvider.js"
import { IMerchantRepository } from "../../core/repository/IMerchantRepository.js"
import { IFileStorageService } from "../services/FileStorageService.js"
import { MerchantControllers } from "./MerchantControllers.js"


export const getMerchantControllers = (dependencyManager: DependencyManager) => {
    const MerchantRepository = getMerchantRepository(dependencyManager)
    const FileStorageService = getFileStorageService(dependencyManager)
    const MerchantActions= getMerchantActions(MerchantRepository, FileStorageService)
    return MerchantControllers(MerchantActions)
}

const getMerchantRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('merchantRepository') as IMerchantRepository
}

const getFileStorageService = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('fileStorageService') as IFileStorageService
}

