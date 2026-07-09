import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../../../helpers/api.js";
import { uploadRaffleImageMiddleware } from "./uploadRaffleImageMiddleware.js";

export const withRaffleImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadRaffleImageMiddleware(req, res, (error: unknown) => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Error al subir la imagen";
      ErrorResponse(res, new Error(message), 400);
      return;
    }
    next();
  });
};
