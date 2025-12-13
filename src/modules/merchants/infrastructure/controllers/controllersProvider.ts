import { DependencyManager } from "../../../../dependencyManager"
import { getMerchantActions } from "../../core/actions/actionsProvider"
import { IMerchantRepository } from "../../core/repository/IMerchantRepository"
import { IFileStorageService } from "../services/FileStorageService"
import { MerchantControllers } from "./MerchantControllers"


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

