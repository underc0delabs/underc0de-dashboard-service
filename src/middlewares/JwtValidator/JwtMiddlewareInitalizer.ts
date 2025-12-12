import { DependencyManager } from "../../dependencyManager";
import { IAdminUserRepository } from "../../modules/adminUsers/core/repository/IAdminUserRepository";
import getJwtValidator from "./infrastructure/GetJwtValidator";

const JwtMiddlewareInitializer = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(getUserRepository(dependencyManager))
    dependencyManager.register('jwtValidator', jwtValidator)
}
const getUserRepository = (dependencyManager:DependencyManager) => {
    return dependencyManager.resolve('adminUserRepository') as IAdminUserRepository
}

export default JwtMiddlewareInitializer