import { DependencyManager } from "../../dependencyManager";
import { MongoUserRepository } from "./infrastructure/repository/MongoUserRepository";
import { BcryptHashService } from "./infrastructure/services/BcryptHashService";

export const UserModuleInitializer = (dependencyManager: DependencyManager) => {
    const userRepository = MongoUserRepository()
    const hashService = BcryptHashService()
    dependencyManager.register('userRepository', userRepository)
    dependencyManager.register('hashService', hashService)
}