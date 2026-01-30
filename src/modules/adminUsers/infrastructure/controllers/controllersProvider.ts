import { DependencyManager } from "../../../../dependencyManager.js"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js"
import { getAdminUserActions } from "../../core/actions/actionsProvider.js"
import { IAdminUserRepository } from "../../core/repository/IAdminUserRepository.js"
import { IHashService } from "../../core/services/IHashService.js"
import { UserControllers } from "./UserControllers.js"


export const getAdminUserControllers = (dependencyManager: DependencyManager) => {
    const AdminUserRepository = getAdminUserRepository(dependencyManager)
    const hashService = getHashService(dependencyManager)
    const UserRepository = getUserRepository(dependencyManager)
    const UserActions= getAdminUserActions(AdminUserRepository, hashService, UserRepository)
    return UserControllers(UserActions)
}

const getAdminUserRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('adminUserRepository') as IAdminUserRepository
}
const getHashService = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('hashService') as IHashService
}
const getUserRepository = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('userRepository') as IUserRepository
}