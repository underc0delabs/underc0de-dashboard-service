import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import type { IBingoActions } from "../../core/actions/bingoActionsProvider.js";
import {
  BingoConflictException,
  BingoEventNotFoundException,
  BingoForbiddenException,
  BingoStandNotFoundException,
  BingoValidationException,
} from "../../core/exceptions/BingoExceptions.js";

const getAdminId = (req: Request): number => {
  const auth = (req as { auth?: { id?: string } }).auth;
  return Number(auth?.id);
};

const getParticipantId = (req: Request): string | null => {
  const auth = (req as { auth?: { participantId?: string } }).auth;
  return auth?.participantId ?? null;
};

export const BingoControllers = (actions: IBingoActions) => {
  const errorResponses = createHashMap(
    {
      [BingoEventNotFoundException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [BingoStandNotFoundException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [BingoConflictException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
      [BingoValidationException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 400),
      [BingoForbiddenException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 403),
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

  const requireParticipant = (req: Request, res: Response): string | null => {
    const participantId = getParticipantId(req);
    if (!participantId) {
      ErrorResponse(res, new Error("No autorizado"), 401);
      return null;
    }
    return participantId;
  };

  return {
    // Admin
    listEventsAdmin(req: Request, res: Response) {
      actions
        .listEventsAdmin()
        .then(result => SuccessResponse(res, 200, "Eventos obtenidos", result))
        .catch(error => handleError(res, error));
    },

    getEventAdmin(req: Request, res: Response) {
      actions
        .getEventAdmin(req.params.id)
        .then(result => SuccessResponse(res, 200, "Evento obtenido", result))
        .catch(error => handleError(res, error));
    },

    createEvent(req: Request, res: Response) {
      actions
        .createEvent(req.body ?? {}, getAdminId(req))
        .then(result => SuccessResponse(res, 201, "Evento creado", result))
        .catch(error => handleError(res, error));
    },

    updateEvent(req: Request, res: Response) {
      actions
        .updateEvent(req.params.id, req.body ?? {})
        .then(result => SuccessResponse(res, 200, "Evento actualizado", result))
        .catch(error => handleError(res, error));
    },

    activateEvent(req: Request, res: Response) {
      actions
        .activateEvent(req.params.id)
        .then(result => SuccessResponse(res, 200, "Evento activado", result))
        .catch(error => handleError(res, error));
    },

    closeEvent(req: Request, res: Response) {
      actions
        .closeEvent(req.params.id)
        .then(result => SuccessResponse(res, 200, "Evento cerrado", result))
        .catch(error => handleError(res, error));
    },

    deleteEvent(req: Request, res: Response) {
      actions
        .deleteEvent(req.params.id)
        .then(result => SuccessResponse(res, 200, "Evento eliminado", result))
        .catch(error => handleError(res, error));
    },

    createStand(req: Request, res: Response) {
      actions
        .createStand(req.params.id, req.body ?? {})
        .then(result => SuccessResponse(res, 201, "Stand creado", result))
        .catch(error => handleError(res, error));
    },

    updateStand(req: Request, res: Response) {
      actions
        .updateStand(req.params.id, req.params.standId, req.body ?? {})
        .then(result => SuccessResponse(res, 200, "Stand actualizado", result))
        .catch(error => handleError(res, error));
    },

    deleteStand(req: Request, res: Response) {
      actions
        .deleteStand(req.params.id, req.params.standId)
        .then(result => SuccessResponse(res, 200, "Stand eliminado", result))
        .catch(error => handleError(res, error));
    },

    listParticipantsAdmin(req: Request, res: Response) {
      actions
        .listParticipantsAdmin(req.params.id)
        .then(result => SuccessResponse(res, 200, "Participantes obtenidos", result))
        .catch(error => handleError(res, error));
    },

    drawAdmin(req: Request, res: Response) {
      actions
        .drawAdmin(req.params.id, getAdminId(req))
        .then(result => SuccessResponse(res, 200, "Ganador sorteado", result))
        .catch(error => handleError(res, error));
    },

    // Participant
    getActiveEvent(req: Request, res: Response) {
      if (!requireParticipant(req, res)) return;
      actions
        .getActiveEvent()
        .then(result => SuccessResponse(res, 200, "Evento activo obtenido", result))
        .catch(error => handleError(res, error));
    },

    joinEvent(req: Request, res: Response) {
      const participantId = requireParticipant(req, res);
      if (!participantId) return;
      actions
        .joinEvent(req.params.id, participantId)
        .then(result => SuccessResponse(res, 200, "Unido al evento", result))
        .catch(error => handleError(res, error));
    },

    getBoard(req: Request, res: Response) {
      const participantId = requireParticipant(req, res);
      if (!participantId) return;
      actions
        .getBoard(req.params.id, participantId)
        .then(result => SuccessResponse(res, 200, "Tablero obtenido", result))
        .catch(error => handleError(res, error));
    },

    checkin(req: Request, res: Response) {
      const participantId = requireParticipant(req, res);
      if (!participantId) return;
      const code = String(req.body?.code ?? "").trim();
      if (!code) {
        ErrorResponse(res, new Error("El código es obligatorio"), 400);
        return;
      }
      actions
        .checkin(req.params.id, participantId, code)
        .then(result => SuccessResponse(res, 200, "Check-in registrado", result))
        .catch(error => handleError(res, error));
    },
  };
};
