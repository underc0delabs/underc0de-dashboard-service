import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import type { IBingoAuthActions } from "../../core/actions/bingoAuthActionsProvider.js";

export const BingoAuthControllers = (authActions: IBingoAuthActions) => ({
  loginWithGoogle(req: Request, res: Response) {
    const idToken = String(req.body?.idToken ?? "").trim();
    authActions
      .loginWithGoogle(idToken)
      .then(result => SuccessResponse(res, 200, "Sesión iniciada", result))
      .catch(error => ErrorResponse(res, error instanceof Error ? error : new Error(String(error)), 400));
  },

  refresh(req: Request, res: Response) {
    const refreshToken = String(req.body?.refreshToken ?? "").trim();
    authActions
      .refresh(refreshToken)
      .then(result => SuccessResponse(res, 200, "Token renovado", result))
      .catch(error => ErrorResponse(res, error instanceof Error ? error : new Error(String(error)), 401));
  },
});
