import { DependencyManager } from "../../dependencyManager.js";
import { IAdminUserRepository } from "../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import { IUserRepository } from "../../modules/users/core/repository/IMongoUserRepository.js";
import getJwtValidator from "./infrastructure/GetJwtValidator.js";

const JwtMiddlewareInitializer = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(
    dependencyManager.resolve("adminUserRepository") as IAdminUserRepository,
    dependencyManager.resolve("userRepository") as IUserRepository
  );
  dependencyManager.register("jwtValidator", jwtValidator);
};

export default JwtMiddlewareInitializer;