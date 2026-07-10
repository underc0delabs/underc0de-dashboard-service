import axios from "axios";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import configs from "../../../configs.js";
import { IAdminUserRepository } from "../../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import { IUserRepository } from "../../../modules/users/core/repository/IMongoUserRepository.js";
import { IJwtValidator } from "../../JwtValidator/core/IJwtValidator.js";

export type AuthPayload = {
  id: string;
  isAdmin: boolean;
  isDashboardUser?: boolean;
};

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
    const forumApiUrl = (configs as any).forum_api_url as string | undefined;
    if (!secret && !forumSecret && !forumApiUrl?.trim()) {
      return res.status(500).json({
        status: 500,
        success: false,
        msg: "Configuración de JWT no disponible",
        type: "auth",
      });
    }

    let lastError: Error | null = null;

    const tryDashboardToken = async (): Promise<boolean> => {
      if (!secret) return false;
      try {
        const decoded = jwt.verify(token, secret) as { id: string | number };
        const id = String(decoded.id);
        const adminUser = await adminUserRepository.getById(id);
        if (adminUser) {
          if (!adminUser.status) {
            return false;
          }
          (req as any).auth = {
            id,
            isAdmin: true,
            isDashboardUser: true,
          } as AuthPayload;
          next();
          return true;
        }
        const appUser = await userRepository.getById(id);
        if (appUser && (appUser as any).status !== false) {
          (req as any).auth = {
            id,
            isAdmin: false,
            isDashboardUser: false,
          } as AuthPayload;
          next();
          return true;
        }
      } catch (err: any) {
        if (err?.name === "TokenExpiredError" || !lastError) lastError = err;
      }
      return false;
    };

    const tryForumToken = async (): Promise<boolean> => {
      if (!forumSecret?.trim()) return false;
      try {
        const decoded = jwt.verify(token, forumSecret) as {
          data?: { email?: string };
          email?: string;
        };
        const email = (decoded.data?.email ?? decoded.email)?.trim?.();
        if (!email) return false;
        const user = await userRepository.getOneByEmailIgnoreCase(email);
        if (!user || (user as any).status === false) return false;
        (req as any).auth = { id: String((user as any).id), isAdmin: false } as AuthPayload;
        next();
        return true;
      } catch (err: any) {
        if (err?.name === "TokenExpiredError" || !lastError) lastError = err;
        return false;
      }
    };

    const tryForumTokenViaApi = async (): Promise<boolean> => {
      const forumApiUrl = (configs as any).forum_api_url as string | undefined;
      if (!forumApiUrl?.trim()) return false;
      try {
        const res = await axios.get(`${forumApiUrl}?action=userData`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
          validateStatus: () => true,
        });
        if (res.status < 200 || res.status >= 300) {
          return false;
        }
        const data = res.data;
        const payload = data?.data ?? data?.result ?? data;
        const email = (
          payload?.email_address ??
          payload?.email ??
          data?.email_address ??
          data?.email
        )?.trim?.();
        if (!email) {
          return false;
        }
        let user = await userRepository.getOneByEmailIgnoreCase(email);
        if (!user) {
          const memberName = (payload?.member_name ?? payload?.memberName ?? email.split("@")[0])?.trim?.() || "Usuario";
          const forumId = payload?.id_member ?? "";
          const username = memberName || `forum_${forumId || email.replace(/[^a-zA-Z0-9]/g, "_")}`;
          (req as any).auth = {
            isNewUser: true,
            email,
            memberName: username,
            forumId: String(forumId),
          };
          next();
          return true;
        }
        if ((user as any).status === false) return false;
        (req as any).auth = { id: String((user as any).id), isAdmin: false } as AuthPayload;
        next();
        return true;
      } catch (err: any) {
        return false;
      }
    };

    const tryAppKeyAuth = (): boolean => {
      const appSecret = (configs as any).app_auth_secret as string | null;
      const key = req.header("x-app-auth-key")?.trim?.();
      const userId = req.header("x-user-id")?.trim?.();
      if (!appSecret) {
        if (key || userId) console.warn("[Auth] app-key: APP_AUTH_SECRET no configurado (headers recibidos:", !!key, !!userId, ")");
        return false;
      }
      if (!key || !userId) {
        if (key || userId) console.warn("[Auth] app-key: faltan headers X-App-Auth-Key o X-User-Id");
        return false;
      }
      if (key !== appSecret) {
        return false;
      }
      (req as any).auth = { id: userId, isAdmin: false } as AuthPayload;
      next();
      return true;
    };

    try {
      // App móvil: X-App-Auth-Key + X-User-Id (APP_AUTH_SECRET). Ir primero evita 401
      // "Sesión expirada" cuando el Bearer (JWT) ya expiró pero la petición es legítima.
      if (tryAppKeyAuth()) return;
      if (await tryDashboardToken()) return;
      if (await tryForumToken()) return;
      if (await tryForumTokenViaApi()) return;

      const appSecret = (configs as any).app_auth_secret as string | null;
      const appKeyHeader = req.header("x-app-auth-key")?.trim?.();
      const userIdHeader = req.header("x-user-id")?.trim?.();
      console.log("[Auth] 401", req.method, req.path, "| APP_SECRET=", !!appSecret, "X-App-Auth-Key=", !!appKeyHeader, "X-User-Id=", userIdHeader || "vacío");

      const err = lastError as Error | null;
      const isExpired = err?.name === "TokenExpiredError";
      const hasForumSecret = Boolean(forumSecret?.trim());
      const hasForumApi = Boolean((configs as any).forum_api_url?.trim());
      const lastErrMsg = (err?.message ?? err?.name ?? "") as string;
      return res.status(401).json({
        status: 401,
        success: false,
        msg: isExpired ? "Sesión expirada" : "Token no válido",
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