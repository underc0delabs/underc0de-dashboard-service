import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { jwtOrAppKeyAuth } from "../../../../middlewares/JwtOrAppKeyAuth.js";
import { requireDashboardUser } from "../../../../middlewares/RequireDashboardUser.js";
import { withEventImageUpload } from "../middlewares/withEventImageUpload.js";
import { getEventControllers } from "../controllers/controllersProvider.js";

const getEventRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = dependencyManager.resolve(
    "jwtValidator",
  ) as IJwtValidator;
  const appAuth = [jwtOrAppKeyAuth(jwtValidator)];
  const dashboardAuth = [jwtValidator, requireDashboardUser];

  const {
    listAdmin,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    listApp,
  } = getEventControllers(dependencyManager);

  const router = Router();

  router.get("/admin/events", dashboardAuth, listAdmin);
  router.get("/admin/events/:id", dashboardAuth, getAdminById);
  router.post("/admin/events", dashboardAuth, withEventImageUpload, createAdmin);
  router.patch(
    "/admin/events/:id",
    dashboardAuth,
    withEventImageUpload,
    updateAdmin,
  );
  router.delete("/admin/events/:id", dashboardAuth, deleteAdmin);

  router.get("/events", appAuth, listApp);

  return router;
};

export default getEventRoutes;
