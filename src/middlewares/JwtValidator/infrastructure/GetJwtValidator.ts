import { NextFunction, Request, Response } from "express";
import configs from "../../../configs.js";
import { IAdminUserRepository } from "../../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import { IUserRepository } from "../../../modules/users/core/repository/IMongoUserRepository.js";
import { IJwtValidator } from "../../JwtValidator/core/IJwtValidator.js";

import jwt from "jsonwebtoken";

export type AuthPayload = { id: string; isAdmin: boolean };

const getJwtValidator = (
  adminUserRepository: IAdminUserRepository,
  userRepository: IUserRepository
): IJwtValidator => {
  const jwtValidator = async (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.header("authorization");
    if (!bearerHeader) {
      return res.status(401).json({
        status: 401,
        success: false,
        msg: "No hay token en la petición",
        type: "auth",
      });
    }
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        success: false,
        msg: "Se necesita el prefijo Bearer",
        type: "auth",
      });
    }

    const secret = configs.secret_key;
    const forumSecret = (configs as any).forum_jwt_secret as string | undefined;
    if (!secret && !forumSecret) {
      return res.status(500).json({
        status: 500,
        success: false,
        msg: "Configuración de JWT no disponible",
        type: "auth",
      });
    }

    const tryDashboardToken = async (): Promise<boolean> => {
      if (!secret) return false;
      try {
        const decoded = jwt.verify(token, secret) as { id: string };
        const id = String(decoded.id);
        const adminUser = await adminUserRepository.getById(id);
        if (adminUser && adminUser.status) {
          (req as any).auth = { id, isAdmin: true } as AuthPayload;
          next();
          return true;
        }
        const appUser = await userRepository.getById(id);
        if (appUser && (appUser as any).status !== false) {
          (req as any).auth = { id, isAdmin: false } as AuthPayload;
          next();
          return true;
        }
      } catch (_) {
        /* no es token del dashboard */
      }
      return false;
    };

    const tryForumToken = async (): Promise<boolean> => {
      if (!forumSecret?.trim()) return false;
      try {
        const decoded = jwt.verify(token, forumSecret) as { data?: { email?: string } };
        const email = decoded.data?.email?.trim?.();
        if (!email) return false;
        const user = await userRepository.getOneByEmailIgnoreCase(email);
        if (!user || (user as any).status === false) return false;
        (req as any).auth = { id: String((user as any).id), isAdmin: false } as AuthPayload;
        next();
        return true;
      } catch (_) {
        return false;
      }
    };

    try {
      if (await tryDashboardToken()) return;
      if (await tryForumToken()) return;
      return res.status(401).json({
        status: 401,
        success: false,
        msg: "Token no válido",
        type: "auth",
      });
    } catch (error: any) {
      return res.status(401).json({
        status: 401,
        success: false,
        msg: error?.name === "TokenExpiredError" ? "Sesión expirada" : "Token no válido",
        type: "auth",
      });
    }
  };

  return jwtValidator;
};

export default getJwtValidator;