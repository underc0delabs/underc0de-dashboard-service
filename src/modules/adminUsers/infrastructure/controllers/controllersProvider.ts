import { DependencyManager } from "../../../../dependencyManager"
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository"
import { getAdminUserActions } from "../../core/actions/actionsProvider"
import { IAdminUserRepository } from "../../core/repository/IAdminUserRepository"
import { IHashService } from "../../core/services/IHashService"
import { UserControllers } from "./UserControllers"


export const getAdminUserControllers = (dependencyManager: DependencyManager) => {
    const AdminUserRepository = getAdminUserRepository(dependencyManager)
    const hashService = getHashService(dependencyManager)
    const UserRepository = getAdminUserRepository(dependencyManager)
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