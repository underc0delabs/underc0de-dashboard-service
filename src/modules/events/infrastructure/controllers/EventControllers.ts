import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import type { IEventActions } from "../../core/actions/eventActionsProvider.js";
import { EventNotFoundException } from "../../core/actions/eventActionsProvider.js";

export const EventControllers = (actions: IEventActions) => {
  const errorResponses = createHashMap(
    {
      [EventNotFoundException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
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
    listAdmin(_req: Request, res: Response) {
      actions
        .listAdmin()
        .then(result => SuccessResponse(res, 200, "Eventos obtenidos", result))
        .catch(error => handleError(res, error));
    },

    getAdminById(req: Request, res: Response) {
      actions
        .getAdminById(req.params.id)
        .then(result => SuccessResponse(res, 200, "Evento obtenido", result))
        .catch(error => handleError(res, error));
    },

    createAdmin(req: Request, res: Response) {
      actions
        .createAdmin(req.body, req.file)
        .then(result => SuccessResponse(res, 201, "Evento creado", result))
        .catch(error => handleError(res, error));
    },

    updateAdmin(req: Request, res: Response) {
      actions
        .updateAdmin(req.params.id, req.body, req.file)
        .then(result => SuccessResponse(res, 200, "Evento actualizado", result))
        .catch(error => handleError(res, error));
    },

    deleteAdmin(req: Request, res: Response) {
      actions
        .deleteAdmin(req.params.id)
        .then(() => SuccessResponse(res, 200, "Evento eliminado", null))
        .catch(error => handleError(res, error));
    },

    listApp(req: Request, res: Response) {
      actions
        .listApp(
          typeof req.query.from === "string" ? req.query.from : undefined,
          typeof req.query.to === "string" ? req.query.to : undefined,
        )
        .then(result => SuccessResponse(res, 200, "Eventos obtenidos", result))
        .catch(error => handleError(res, error));
    },
  };
};
