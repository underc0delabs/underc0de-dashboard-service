import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "./JwtValidator/infrastructure/GetJwtValidator.js";

/**
 * Use after jwtValidator. Ensures the authenticated user is an admin.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) {
    return res.status(401).json({
      status: 401,
      success: false,
      msg: "No autorizado",
      type: "auth",
    });
  }
  if (!auth.isAdmin) {
    return res.status(403).json({
      status: 403,
      success: false,
      msg: "Se requieren permisos de administrador",
      type: "auth",
    });
  }
  next();
};
