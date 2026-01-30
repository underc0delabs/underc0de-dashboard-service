import { DependencyManager } from "../../dependencyManager.js";
import { IAdminUserRepository } from "../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import getJwtValidator from "./infrastructure/GetJwtValidator.js";

const JwtMiddlewareInitializer = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(getUserRepository(dependencyManager))
    dependencyManager.register('jwtValidator', jwtValidator)
}
const getUserRepository = (dependencyManager:DependencyManager) => {
    return dependencyManager.resolve('adminUserRepository') as IAdminUserRepository
}

export default JwtMiddlewareInitializer