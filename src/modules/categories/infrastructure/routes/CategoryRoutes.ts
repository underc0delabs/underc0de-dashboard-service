import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { getCategoryControllers } from "../controllers/controllersProvider.js";

const getCategoryRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const { save, edit, remove, get, getById } =
    getCategoryControllers(dependencyManager);
  const categoryRouter = Router();
  const path = "categories";

  categoryRouter.get(`/${path}`, get);
  categoryRouter.get(`/${path}/:id`, getById);
  categoryRouter.post(`/${path}`, [jwtValidator], save);
  categoryRouter.patch(`/${path}/:id`, [jwtValidator], edit);
  categoryRouter.delete(`/${path}/:id`, [jwtValidator], remove);

  return categoryRouter;
};

const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getCategoryRoutes;
