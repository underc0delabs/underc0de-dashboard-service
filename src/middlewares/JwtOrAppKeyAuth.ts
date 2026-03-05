import { Request, Response, NextFunction } from "express";
import { IJwtValidator } from "./JwtValidator/core/IJwtValidator.js";
import { appKeyAuth } from "./AppKeyAuth.js";

/**
 * Si hay X-App-Auth-Key y X-User-Id → appKeyAuth (app móvil).
 * Si no → jwtValidator (admin con Bearer token).
 * Permite que admin y app usen GET /users/me y PATCH /users/:id.
 */
export const jwtOrAppKeyAuth = (jwtValidator: IJwtValidator) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasAppKey =
      req.header("x-app-auth-key")?.trim() && req.header("x-user-id")?.trim();
    if (hasAppKey) {
      return appKeyAuth(req, res, next);
    }
    return jwtValidator(req, res, next);
  };
};
