import axios from "axios";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import configs from "../../../configs.js";
import { IAdminUserRepository } from "../../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import { IUserRepository } from "../../../modules/users/core/repository/IMongoUserRepository.js";
import { IJwtValidator } from "../../JwtValidator/core/IJwtValidator.js";

export type AuthPayload = { id: string; isAdmin: boolean };

const getJwtValidator = (
  adminUserRepository: IAdminUserRepository,
  userRepository: IUserRepository
): IJwtValidator => {
  const jwtValidator = async (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.header("authorization");
    if (!bearerHeader) {
      console.warn("[Auth] 401: No hay header Authorization");
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
          console.warn("[Auth] foro-api status:", res.status, "keys:", res.data ? Object.keys(res.data).slice(0, 5) : []);
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
          console.warn("[Auth] foro-api: sin email en respuesta, keys:", data ? Object.keys(data).slice(0, 8) : []);
          return false;
        }
        let user = await userRepository.getOneByEmailIgnoreCase(email);
        if (!user) {
          try {
            const memberName = (payload?.member_name ?? payload?.memberName ?? email.split("@")[0])?.trim?.() || "Usuario";
            const forumId = payload?.id_member ?? "";
            const username = memberName || `forum_${forumId || email.replace(/[^a-zA-Z0-9]/g, "_")}`;
            const newUser = await userRepository.save({
              username,
              name: memberName,
              lastname: "",
              phone: "",
              email,
              password: crypto.randomBytes(32).toString("hex"),
              userType: 0,
              birthday: new Date(),
              status: true,
            } as any);
            user = newUser;
          } catch (createErr: any) {
            console.warn("[Auth] foro-api: no se pudo crear usuario:", createErr?.message ?? createErr);
            return false;
          }
        }
        if ((user as any).status === false) return false;
        (req as any).auth = { id: String((user as any).id), isAdmin: false } as AuthPayload;
        next();
        return true;
      } catch (err: any) {
        console.warn("[Auth] foro-api error:", err?.message ?? err);
        return false;
      }
    };

    try {
      if (await tryDashboardToken()) return;
      if (await tryForumToken()) return;
      if (await tryForumTokenViaApi()) return;

      const isExpired = lastError?.name === "TokenExpiredError";
      const hasForumSecret = Boolean(forumSecret?.trim());
      const hasForumApi = Boolean((configs as any).forum_api_url?.trim());
      console.warn("[Auth] 401:", isExpired
        ? "Token expirado"
        : `Token no válido (dashboard: ${secret ? "ok" : "sin secret"}, foro-jwt: ${hasForumSecret ? "ok" : "no"}, foro-api: ${hasForumApi ? "ok" : "no"})`
      );
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