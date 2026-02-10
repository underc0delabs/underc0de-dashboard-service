import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { allowOnlySelfOrAdmin } from "../../../../middlewares/AllowOnlySelfOrAdmin.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { getUserControllers } from "../controllers/controllersProvider.js";

const getUserRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const {
    save,
    edit,
    remove,
    get,
    getById,
    login,
    refreshToken,
    saveFcmToken,
    getMetrics,
    getByUsername,
    linkSubscription,
  } = getUserControllers(dependencyManager);
  const userRouter = Router();
  const path = "users";

  userRouter.post(`/login`, login);
  userRouter.post(`/${path}/refresh-token`, refreshToken);
  userRouter.post(`/${path}`, [jwtValidator], save);
  userRouter.get(`/${path}`, [jwtValidator], get);
  userRouter.get(`/${path}/metrics`, [jwtValidator], getMetrics);
  userRouter.post(`/${path}/fcm-token`, saveFcmToken);
  userRouter.post(
    `/${path}/link-subscription`,
    linkSubscription
  );
  userRouter.get(`/${path}/:id`, [jwtValidator], getById);
  userRouter.get(`/${path}/get-by-username/:username`, getByUsername);
  userRouter.patch(`/${path}/:id`, [jwtValidator, allowOnlySelfOrAdmin], edit);
  userRouter.delete(`/${path}/:id`, [jwtValidator], remove);
  return userRouter;
};
const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getUserRoutes;
