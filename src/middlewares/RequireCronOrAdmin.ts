import { NextFunction, Request, Response } from "express";
import { IJwtValidator } from "./JwtValidator/core/IJwtValidator.js";
import { requireAdmin } from "./RequireAdmin.js";

/**
 * Rutas /cron/*: acepta X-Cron-Secret (servidor / pm2) o JWT de admin del panel.
 */
export const requireCronOrAdmin = (jwtValidator: IJwtValidator) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cronSecret = process.env.CRON_SECRET?.trim();
    const headerSecret = req.header("x-cron-secret")?.trim();

    if (cronSecret && headerSecret && headerSecret === cronSecret) {
      return next();
    }

    return jwtValidator(req, res, () => requireAdmin(req, res, next));
  };
};
