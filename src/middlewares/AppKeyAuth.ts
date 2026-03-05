import { NextFunction, Request, Response } from "express";
import configs from "../configs.js";

/**
 * Middleware que autentica por X-App-Auth-Key y X-User-Id.
 * Solo requiere que APP_AUTH_SECRET esté en .env.
 */
export const appKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.APP_AUTH_SECRET?.trim();
  const key = req.header("x-app-auth-key")?.trim();
  const userId = req.header("x-user-id")?.trim();

  if (!secret) {
    return res.status(500).json({
      status: 500,
      success: false,
      msg: "APP_AUTH_SECRET no configurado",
      type: "auth",
    });
  }

  if (!key || !userId) {
    return res.status(401).json({
      status: 401,
      success: false,
      msg: "Se requieren X-App-Auth-Key y X-User-Id",
      type: "auth",
    });
  }

  if (key !== secret) {
    return res.status(401).json({
      status: 401,
      success: false,
      msg: "Clave inválida",
      type: "auth",
    });
  }

  const resourceId = String((req as any).params?.id ?? "");
  if (resourceId && userId !== resourceId) {
    return res.status(403).json({
      status: 403,
      success: false,
      msg: "No podés modificar otro usuario",
      type: "auth",
    });
  }

  (req as any).auth = { id: userId, isAdmin: false };
  next();
};
