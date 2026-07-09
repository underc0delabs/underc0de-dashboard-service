import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { UserNotActiveException } from "../../../users/core/exceptions/UserNotActiveException.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IConnectionActions } from "../../core/actions/connectionActionsProvider.js";
import {
  ConnectionConflictException,
  ConnectionNotFoundException,
  SelfActionException,
  UserBlockedException,
} from "../../core/exceptions/ConnectionExceptions.js";

const getActorId = (req: Request): number => {
  const auth = (req as { auth?: { id?: string } }).auth;
  return Number(auth?.id);
};

const getOptionalViewerId = (req: Request): number | null => {
  const auth = (req as { auth?: { id?: string } }).auth;
  if (auth?.id) {
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

  return null;
};

export const ConnectionControllers = (actions: IConnectionActions) => {
  const errorResponses = createHashMap(
    {
      [UserNotExistException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [UserNotActiveException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
      [ConnectionNotFoundException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [ConnectionConflictException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
      [SelfActionException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 400),
      [UserBlockedException.name]: (res: Response, error: Error) =>
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

  return {
    resolve(req: Request, res: Response) {
      const shareCode = typeof req.query.shareCode === "string" ? req.query.shareCode : undefined;
      const member = typeof req.query.member === "string" ? req.query.member : undefined;

      if (!shareCode?.trim() && !member?.trim()) {
        ErrorResponse(res, new Error("Se requiere shareCode o member"), 400);
        return;
      }

      actions
        .resolveProfile({
          shareCode,
          member,
          viewerId: getOptionalViewerId(req),
        })
        .then((profile) => {
          SuccessResponse(res, 200, "Perfil resuelto con éxito", profile);
        })
        .catch((error) => handleError(res, error));
    },

    ensureShareCode(req: Request, res: Response) {
      actions
        .ensureShareCode(getActorId(req))
        .then((result) => {
          SuccessResponse(res, 200, "Código de compartir obtenido", result);
        })
        .catch((error) => handleError(res, error));
    },

    rotateShareCode(req: Request, res: Response) {
      actions
        .rotateShareCode(getActorId(req))
        .then((result) => {
          SuccessResponse(res, 200, "Código de compartir actualizado", result);
        })
        .catch((error) => handleError(res, error));
    },

    sendFriendRequest(req: Request, res: Response) {
      const targetUserId = Number(req.body?.targetUserId);
      if (!Number.isFinite(targetUserId)) {
        ErrorResponse(res, new Error("targetUserId inválido"), 400);
        return;
      }

      actions
        .sendFriendRequest(getActorId(req), targetUserId)
        .then((result) => {
          SuccessResponse(res, 201, "Solicitud de amistad enviada", result);
        })
        .catch((error) => handleError(res, error));
    },

    acceptFriendRequest(req: Request, res: Response) {
      actions
        .acceptFriendRequest(getActorId(req), req.params.id)
        .then((result) => {
          SuccessResponse(res, 200, "Solicitud aceptada", result);
        })
        .catch((error) => handleError(res, error));
    },

    rejectFriendRequest(req: Request, res: Response) {
      actions
        .rejectFriendRequest(getActorId(req), req.params.id)
        .then((result) => {
          SuccessResponse(res, 200, "Solicitud rechazada", result);
        })
        .catch((error) => handleError(res, error));
    },

    cancelFriendRequest(req: Request, res: Response) {
      actions
        .cancelFriendRequest(getActorId(req), req.params.id)
        .then(() => {
          SuccessResponse(res, 200, "Solicitud cancelada", null);
        })
        .catch((error) => handleError(res, error));
    },

    listFriends(req: Request, res: Response) {
      actions
        .listFriends(getActorId(req))
        .then((friends) => {
          SuccessResponse(res, 200, "Amigos obtenidos con éxito", friends);
        })
        .catch((error) => handleError(res, error));
    },

    listIncomingRequests(req: Request, res: Response) {
      actions
        .listIncomingRequests(getActorId(req))
        .then((requests) => {
          SuccessResponse(res, 200, "Solicitudes entrantes obtenidas", requests);
        })
        .catch((error) => handleError(res, error));
    },

    listOutgoingRequests(req: Request, res: Response) {
      actions
        .listOutgoingRequests(getActorId(req))
        .then((requests) => {
          SuccessResponse(res, 200, "Solicitudes salientes obtenidas", requests);
        })
        .catch((error) => handleError(res, error));
    },

    followUser(req: Request, res: Response) {
      const targetUserId = Number(req.params.userId);
      if (!Number.isFinite(targetUserId)) {
        ErrorResponse(res, new Error("userId inválido"), 400);
        return;
      }

      actions
        .followUser(getActorId(req), targetUserId)
        .then((result) => {
          SuccessResponse(res, 201, "Usuario seguido", result);
        })
        .catch((error) => handleError(res, error));
    },

    unfollowUser(req: Request, res: Response) {
      const targetUserId = Number(req.params.userId);
      if (!Number.isFinite(targetUserId)) {
        ErrorResponse(res, new Error("userId inválido"), 400);
        return;
      }

      actions
        .unfollowUser(getActorId(req), targetUserId)
        .then(() => {
          SuccessResponse(res, 200, "Dejaste de seguir al usuario", null);
        })
        .catch((error) => handleError(res, error));
    },

    listFollowing(req: Request, res: Response) {
      actions
        .listFollowing(getActorId(req))
        .then((users) => {
          SuccessResponse(res, 200, "Seguidos obtenidos con éxito", users);
        })
        .catch((error) => handleError(res, error));
    },

    listFollowers(req: Request, res: Response) {
      actions
        .listFollowers(getActorId(req))
        .then((users) => {
          SuccessResponse(res, 200, "Seguidores obtenidos con éxito", users);
        })
        .catch((error) => handleError(res, error));
    },

    blockUser(req: Request, res: Response) {
      const targetUserId = Number(req.params.userId);
      if (!Number.isFinite(targetUserId)) {
        ErrorResponse(res, new Error("userId inválido"), 400);
        return;
      }

      actions
        .blockUser(getActorId(req), targetUserId)
        .then((result) => {
          SuccessResponse(res, 200, "Usuario bloqueado", result);
        })
        .catch((error) => handleError(res, error));
    },
  };
};
