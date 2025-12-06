import { DependencyManager } from "../../../../dependencyManager"
import { getAdminUserActions } from "../../core/actions/actionsProvider"
import { IAdminUserRepository } from "../../core/repository/IAdminUserRepository"
import { IHashService } from "../../core/services/IHashService"
import { UserControllers } from "./UserControllers"


export const getAdminUserControllers = (dependencyManager: DependencyManager) => {
    const UserRepository = getAdminUserRepository(dependencyManager)
    const hashService = getHashService(dependencyManager)
    const UserActions= getAdminUserActions(UserRepository, hashService)
    return UserControllers(UserActions)
}

const getAdminUserRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('adminUserRepository') as IAdminUserRepository
}
const getHashService = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('hashService') as IHashService
}