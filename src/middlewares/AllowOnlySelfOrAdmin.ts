import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "./JwtValidator/infrastructure/GetJwtValidator.js";

/**
 * Use after jwtValidator. Ensures non-admin users can only act on their own resource (params.id).
 */
export const allowOnlySelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) {
    return res.status(401).json({
      status: 401,
      success: false,
      msg: "No autorizado",
      type: "auth",
    });
  }
  if (auth.isAdmin) return next();
  const resourceId = String((req as any).params?.id ?? "");
  if (auth.id !== resourceId) {
    return res.status(403).json({
      status: 403,
      success: false,
      msg: "Solo podés editar tu propio perfil",
      type: "auth",
    });
  }
  next();
};
