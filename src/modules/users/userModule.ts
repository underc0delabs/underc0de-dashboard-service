import { DependencyManager } from "../../dependencyManager.js";
import { MongoUserRepository } from "./infrastructure/repository/MongoUserRepository.js";
import { RefreshTokenRepository } from "./infrastructure/repository/RefreshTokenRepository.js";
import { BcryptHashService } from "./infrastructure/services/BcryptHashService.js";

export const UserModuleInitializer = (dependencyManager: DependencyManager) => {
  const userRepository = MongoUserRepository();
  const refreshTokenRepository = RefreshTokenRepository();
  const hashService = BcryptHashService();
  dependencyManager.register("userRepository", userRepository);
  dependencyManager.register("refreshTokenRepository", refreshTokenRepository);
  dependencyManager.register("hashService", hashService);
};