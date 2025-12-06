import { DependencyManager } from "../../dependencyManager";
import { IUserRepository } from "../../modules/users/core/repository/IMongoUserRepository";
import getJwtValidator from "./infrastructure/GetJwtValidator";

const JwtMiddlewareInitializer = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(getUserRepository(dependencyManager))
    dependencyManager.register('jwtValidator', jwtValidator)
}
const getUserRepository = (dependencyManager:DependencyManager) => {
    return dependencyManager.resolve('userRepository') as IUserRepository
}

export default JwtMiddlewareInitializer