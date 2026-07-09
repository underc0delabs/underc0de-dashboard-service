import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { jwtOrAppKeyAuth } from "../../../../middlewares/JwtOrAppKeyAuth.js";
import { requireAdmin } from "../../../../middlewares/RequireAdmin.js";
import { withRaffleImageUpload } from "../middlewares/withRaffleImageUpload.js";
import { getRaffleControllers } from "../controllers/controllersProvider.js";

const getRaffleRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = dependencyManager.resolve(
    "jwtValidator",
  ) as IJwtValidator;
  const appAuth = [jwtOrAppKeyAuth(jwtValidator)];
  const adminAuth = [jwtValidator, requireAdmin];
  const adminEditorAuth = [jwtValidator];

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
    listParticipantsAdmin,
    listEventsAdmin,
    listApp,
    getAppById,
    enterApp,
  } = getRaffleControllers(dependencyManager);

  const router = Router();

  router.get("/admin/raffles", adminEditorAuth, listAdmin);
  router.get("/admin/raffles/:id", adminEditorAuth, getAdminById);
  router.post(
    "/admin/raffles",
    adminEditorAuth,
    withRaffleImageUpload,
    createAdmin,
  );
  router.patch(
    "/admin/raffles/:id",
    adminEditorAuth,
    withRaffleImageUpload,
    updateAdmin,
  );
  router.post("/admin/raffles/:id/publish", adminAuth, publishAdmin);
  router.post("/admin/raffles/:id/close", adminAuth, closeAdmin);
  router.post("/admin/raffles/:id/draw", adminAuth, drawAdmin);
  router.post("/admin/raffles/:id/redraw", adminAuth, redrawAdmin);
  router.post("/admin/raffles/:id/claim", adminAuth, claimAdmin);
  router.post("/admin/raffles/:id/duplicate", adminEditorAuth, duplicateAdmin);
  router.delete("/admin/raffles/:id", adminEditorAuth, deleteAdmin);
  router.get("/admin/raffles/:id/participants", adminEditorAuth, listParticipantsAdmin);
  router.get("/admin/raffles/:id/events", adminEditorAuth, listEventsAdmin);

  router.get("/raffles", appAuth, listApp);
  router.get("/raffles/:id", appAuth, getAppById);
  router.post("/raffles/:id/enter", appAuth, enterApp);

  return router;
};

export default getRaffleRoutes;
