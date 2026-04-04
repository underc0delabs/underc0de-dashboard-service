import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { requireAdmin } from "../../../../middlewares/RequireAdmin.js";
import { getAdminMemberControllers } from "../controllers/controllersProvider.js";

const getAdminMemberRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = dependencyManager.resolve(
    "jwtValidator"
  ) as IJwtValidator;
  const {
    provision,
    getByAppUser,
    patchForum,
    patchMercadoPago,
    linkSubscription,
  } = getAdminMemberControllers(dependencyManager);

  const router = Router();
  const base = "admin/members";

  router.post(`/${base}/provision`, [jwtValidator, requireAdmin], provision);
  router.get(
    `/${base}/by-app-user/:appUserId`,
    [jwtValidator, requireAdmin],
    getByAppUser
  );
  router.patch(
    `/${base}/by-app-user/:appUserId/forum`,
    [jwtValidator, requireAdmin],
    patchForum
  );
  router.patch(
    `/${base}/by-app-user/:appUserId/mercadopago`,
    [jwtValidator, requireAdmin],
    patchMercadoPago
  );
  router.post(
    `/${base}/by-app-user/:appUserId/link-subscription`,
    [jwtValidator, requireAdmin],
    linkSubscription
  );

  return router;
};

export default getAdminMemberRoutes;
