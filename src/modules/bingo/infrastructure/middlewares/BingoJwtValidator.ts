import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import configs from "../../../../configs.js";
import type { IBingoRepository } from "../repository/BingoRepository.js";

export type BingoAuthPayload = {
  participantId: string;
  isBingoParticipant: true;
};

export const getBingoJwtValidator = (repo: IBingoRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.header("authorization");
    const token = bearerHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: 401,
        success: false,
        msg: "No hay token en la petición",
        type: "auth",
      });
    }

    try {
      const decoded = jwt.verify(token, configs.secret_key as string) as { id: string };
      const participant = await repo.findParticipantById(decoded.id);
      if (!participant) {
        return res.status(401).json({
          status: 401,
          success: false,
          msg: "Token no válido",
          type: "auth",
        });
      }
      (req as any).auth = {
        participantId: participant.id,
        isBingoParticipant: true,
      } as BingoAuthPayload;
      next();
    } catch (error: any) {
      return res.status(401).json({
        status: 401,
        success: false,
        msg: error?.name === "TokenExpiredError" ? "Sesión expirada" : "Token no válido",
        type: "auth",
      });
    }
  };
};
