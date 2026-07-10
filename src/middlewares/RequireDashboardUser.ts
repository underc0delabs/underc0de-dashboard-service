import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "./JwtValidator/infrastructure/GetJwtValidator.js";

/**
 * Use after jwtValidator. Allows any active dashboard user (Admin or Editor).
 */
export const requireDashboardUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) {
    return res.status(401).json({
      status: 401,
      success: false,
      msg: "No autorizado",
      type: "auth",
    });
  }
  if (!auth.isDashboardUser) {
    return res.status(403).json({
      status: 403,
      success: false,
      msg: "Se requieren permisos de administrador",
      type: "auth",
    });
  }
  next();
};
