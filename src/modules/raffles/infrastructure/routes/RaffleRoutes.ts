import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { jwtOrAppKeyAuth } from "../../../../middlewares/JwtOrAppKeyAuth.js";
import { requireDashboardUser } from "../../../../middlewares/RequireDashboardUser.js";
import { withRaffleImageUpload } from "../middlewares/withRaffleImageUpload.js";
import { getRaffleControllers } from "../controllers/controllersProvider.js";

const getRaffleRoutes = (dependencyManager: DependencyManager) => {
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
    publishAdmin,
    closeAdmin,
    drawAdmin,
    redrawAdmin,
    claimAdmin,
    deleteAdmin,
    duplicateAdmin,
    setVisibleInAppAdmin,
    listParticipantsAdmin,
    listEventsAdmin,
    listApp,
    getAppById,
    enterApp,
  } = getRaffleControllers(dependencyManager);

  const router = Router();

  router.get("/admin/raffles", dashboardAuth, listAdmin);
  router.get("/admin/raffles/:id", dashboardAuth, getAdminById);
  router.post(
    "/admin/raffles",
    dashboardAuth,
    withRaffleImageUpload,
    createAdmin,
  );
  router.patch(
    "/admin/raffles/:id",
    dashboardAuth,
    withRaffleImageUpload,
    updateAdmin,
  );
  router.post("/admin/raffles/:id/publish", dashboardAuth, publishAdmin);
  router.post("/admin/raffles/:id/close", dashboardAuth, closeAdmin);
  router.post("/admin/raffles/:id/draw", dashboardAuth, drawAdmin);
  router.post("/admin/raffles/:id/redraw", dashboardAuth, redrawAdmin);
  router.post("/admin/raffles/:id/claim", dashboardAuth, claimAdmin);
  router.post("/admin/raffles/:id/duplicate", dashboardAuth, duplicateAdmin);
  router.patch(
    "/admin/raffles/:id/visibility",
    dashboardAuth,
    setVisibleInAppAdmin,
  );
  router.delete("/admin/raffles/:id", dashboardAuth, deleteAdmin);
  router.get("/admin/raffles/:id/participants", dashboardAuth, listParticipantsAdmin);
  router.get("/admin/raffles/:id/events", dashboardAuth, listEventsAdmin);

  router.get("/raffles", appAuth, listApp);
  router.get("/raffles/:id", appAuth, getAppById);
  router.post("/raffles/:id/enter", appAuth, enterApp);

  return router;
};

export default getRaffleRoutes;
