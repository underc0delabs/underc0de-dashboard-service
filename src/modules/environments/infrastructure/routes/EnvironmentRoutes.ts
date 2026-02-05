import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { getEnvironmentControllers } from "../controllers/controllersProvider.js";

const getEnvironmentRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const { getEnvironment, updateEnvironment } = getEnvironmentControllers(dependencyManager);
  const environmentRouter = Router();
  const path = "environments";

  environmentRouter.get(`/${path}/:key`, [jwtValidator], getEnvironment);
  environmentRouter.patch(`/${path}/:key`, [jwtValidator], updateEnvironment);

  return environmentRouter;
};

const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getEnvironmentRoutes;
