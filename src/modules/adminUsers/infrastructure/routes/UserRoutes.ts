import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager";
import { IJwtValidator } from "../../../../middlewares/jwtValidator/core/IJwtValidator";
import { getAdminUserControllers } from "../controllers/controllersProvider";

const getAdminUserRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const { save, edit, remove, get, getById, login, getUsersMetrics } =
    getAdminUserControllers(dependencyManager);
  const userRouter = Router();
  const path = "admin-users";

  userRouter.post(`/${path}/login`, login);
  userRouter.post(`/${path}`, [jwtValidator], save);
  userRouter.get(`/${path}`, [jwtValidator], get);
  userRouter.get(`/${path}/:id`, [jwtValidator], getById);
  userRouter.patch(`/${path}/:id`, [jwtValidator], edit);
  userRouter.delete(`/${path}/:id`, [jwtValidator], remove);
  userRouter.post(`/${path}/users-metrics`, getUsersMetrics);

  return userRouter;
};
const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getAdminUserRoutes;
