import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../../../helpers/api.js";
import { uploadStandLogoMiddleware } from "./uploadStandLogoMiddleware.js";

export const withStandLogoUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadStandLogoMiddleware(req, res, (error: unknown) => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Error al subir el logo";
      ErrorResponse(res, new Error(message), 400);
      return;
    }
    next();
  });
};
