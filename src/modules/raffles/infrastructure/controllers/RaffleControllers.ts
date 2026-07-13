import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { UserNotActiveException } from "../../../users/core/exceptions/UserNotActiveException.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import type { IRaffleActions } from "../../core/actions/raffleActionsProvider.js";
import {
  RaffleConflictException,
  RaffleForbiddenException,
  RaffleNotFoundException,
  RaffleValidationException,
} from "../../core/exceptions/RaffleExceptions.js";

const getAdminId = (req: Request): number => {
  const auth = (req as { auth?: { id?: string; isAdmin?: boolean } }).auth;
  return Number(auth?.id);
};

const getAppUserId = (req: Request): number | null => {
  const auth = (req as { auth?: { id?: string; isAdmin?: boolean } }).auth;
  if (auth?.id && !auth.isAdmin) {
    const id = Number(auth.id);
    return Number.isFinite(id) ? id : null;
  }

  const secret = process.env.APP_AUTH_SECRET?.trim();
  const key = req.header("x-app-auth-key")?.trim();
  const userId = req.header("x-user-id")?.trim();
  if (secret && key === secret && userId) {
    const id = Number(userId);
    return Number.isFinite(id) ? id : null;
  }

  if (auth?.id) {
    const id = Number(auth.id);
    return Number.isFinite(id) ? id : null;
  }

  return null;
};

export const RaffleControllers = (actions: IRaffleActions) => {
  const errorResponses = createHashMap(
    {
      [RaffleNotFoundException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [RaffleValidationException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 400),
      [RaffleConflictException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
      [RaffleForbiddenException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 403),
      [UserNotExistException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [UserNotActiveException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
    },
    (res: Response, error: Error) => ErrorResponse(res, error),
  ) as Record<string, (res: Response, error: Error) => void>;

  const handleError = (res: Response, error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    if (errorResponses[err.name]) {
      errorResponses[err.name](res, err);
      return;
    }
    ErrorResponse(res, err);
  };

  return {
    listAdmin(req: Request, res: Response) {
      actions
        .listAdmin()
        .then(result => SuccessResponse(res, 200, "Sorteos obtenidos", result))
        .catch(error => handleError(res, error));
    },

    getAdminById(req: Request, res: Response) {
      actions
        .getAdminById(req.params.id)
        .then(result => SuccessResponse(res, 200, "Sorteo obtenido", result))
        .catch(error => handleError(res, error));
    },

    createAdmin(req: Request, res: Response) {
      const file = (req as { file?: Express.Multer.File }).file;
      actions
        .createAdmin(req.body ?? {}, getAdminId(req), file)
        .then(result =>
          SuccessResponse(res, 201, "Sorteo creado", result),
        )
        .catch(error => handleError(res, error));
    },

    updateAdmin(req: Request, res: Response) {
      const file = (req as { file?: Express.Multer.File }).file;
      actions
        .updateAdmin(req.params.id, req.body ?? {}, file)
        .then(result =>
          SuccessResponse(res, 200, "Sorteo actualizado", result),
        )
        .catch(error => handleError(res, error));
    },

    publishAdmin(req: Request, res: Response) {
      actions
        .publishAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 200, "Sorteo publicado", result),
        )
        .catch(error => handleError(res, error));
    },

    closeAdmin(req: Request, res: Response) {
      actions
        .closeAdmin(req.params.id, getAdminId(req))
        .then(result => {
          const status = (result as { status?: string })?.status;
          const message =
            status === "drawn"
              ? "Participación cerrada y ganador sorteado"
              : "Participación cerrada";
          SuccessResponse(res, 200, message, result);
        })
        .catch(error => handleError(res, error));
    },

    drawAdmin(req: Request, res: Response) {
      actions
        .drawAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 200, "Ganador sorteado", result),
        )
        .catch(error => handleError(res, error));
    },

    redrawAdmin(req: Request, res: Response) {
      actions
        .redrawAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 200, "Re-sorteo realizado", result),
        )
        .catch(error => handleError(res, error));
    },

    claimAdmin(req: Request, res: Response) {
      actions
        .claimAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 200, "Premio marcado como entregado", result),
        )
        .catch(error => handleError(res, error));
    },

    deleteAdmin(req: Request, res: Response) {
      actions
        .deleteAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 200, "Sorteo eliminado", result),
        )
        .catch(error => handleError(res, error));
    },

    duplicateAdmin(req: Request, res: Response) {
      actions
        .duplicateAdmin(req.params.id, getAdminId(req))
        .then(result =>
          SuccessResponse(res, 201, "Sorteo duplicado", result),
        )
        .catch(error => handleError(res, error));
    },

    setVisibleInAppAdmin(req: Request, res: Response) {
      const visibleInApp = req.body?.visibleInApp;
      actions
        .setVisibleInAppAdmin(req.params.id, visibleInApp, getAdminId(req))
        .then(result =>
          SuccessResponse(
            res,
            200,
            visibleInApp === false
              ? "Sorteo oculto en la app"
              : "Sorteo visible en la app",
            result,
          ),
        )
        .catch(error => handleError(res, error));
    },

    listParticipantsAdmin(req: Request, res: Response) {
      actions
        .listParticipantsAdmin(req.params.id)
        .then(result =>
          SuccessResponse(res, 200, "Participantes obtenidos", result),
        )
        .catch(error => handleError(res, error));
    },

    listEventsAdmin(req: Request, res: Response) {
      actions
        .listEventsAdmin(req.params.id)
        .then(result =>
          SuccessResponse(res, 200, "Eventos obtenidos", result),
        )
        .catch(error => handleError(res, error));
    },

    listApp(req: Request, res: Response) {
      const userId = getAppUserId(req);
      if (!userId) {
        ErrorResponse(res, new Error("No autorizado"), 401);
        return;
      }
      actions
        .listApp(userId)
        .then(result => SuccessResponse(res, 200, "Sorteos obtenidos", result))
        .catch(error => handleError(res, error));
    },

    getAppById(req: Request, res: Response) {
      const userId = getAppUserId(req);
      if (!userId) {
        ErrorResponse(res, new Error("No autorizado"), 401);
        return;
      }
      actions
        .getAppById(req.params.id, userId)
        .then(result => SuccessResponse(res, 200, "Sorteo obtenido", result))
        .catch(error => handleError(res, error));
    },

    enterApp(req: Request, res: Response) {
      const userId = getAppUserId(req);
      if (!userId) {
        ErrorResponse(res, new Error("No autorizado"), 401);
        return;
      }
      actions
        .enterApp(req.params.id, userId)
        .then(result =>
          SuccessResponse(res, 201, "Participación registrada", result),
        )
        .catch(error => handleError(res, error));
    },
  };
};
