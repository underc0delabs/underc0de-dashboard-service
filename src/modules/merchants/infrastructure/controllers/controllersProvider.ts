import { DependencyManager } from "../../../../dependencyManager"
import { getMerchantActions } from "../../core/actions/actionsProvider"
import { IMerchantRepository } from "../../core/repository/IMerchantRepository"
import { MerchantControllers } from "./MerchantControllers"


export const getMerchantControllers = (dependencyManager: DependencyManager) => {
    const MerchantRepository = getMerchantRepository(dependencyManager)
    const MerchantActions= getMerchantActions(MerchantRepository)
    return MerchantControllers(MerchantActions)
}

const getMerchantRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('merchantRepository') as IMerchantRepository
}

