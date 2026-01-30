import { DependencyManager } from "../../dependencyManager.js";
import { MongoUserRepository } from "./infrastructure/repository/MongoUserRepository.js";
import { BcryptHashService } from "./infrastructure/services/BcryptHashService.js";

export const UserModuleInitializer = (dependencyManager: DependencyManager) => {
    const userRepository = MongoUserRepository()
    const hashService = BcryptHashService()
    dependencyManager.register('userRepository', userRepository)
    dependencyManager.register('hashService', hashService)
}