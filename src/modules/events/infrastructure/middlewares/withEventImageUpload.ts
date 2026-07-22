import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../../../helpers/api.js";
import { uploadEventImageMiddleware } from "./uploadEventImageMiddleware.js";

export const withEventImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadEventImageMiddleware(req, res, (error: unknown) => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Error al subir la imagen";
      ErrorResponse(res, new Error(message), 400);
      return;
    }
    next();
  });
};
