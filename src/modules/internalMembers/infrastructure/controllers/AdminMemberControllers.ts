import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { MemberConflictException } from "../../core/exceptions/MemberConflictException.js";
import { MemberNotFoundException } from "../../core/exceptions/MemberNotFoundException.js";
import { IProvisionAppUserAndMemberAction } from "../../core/actions/ProvisionAppUserAndMemberAction.js";
import { IGetMemberBundleByAppUserIdAction } from "../../core/actions/GetMemberBundleByAppUserIdAction.js";
import { IPatchForumLinkByAppUserIdAction } from "../../core/actions/PatchForumLinkByAppUserIdAction.js";
import { IPatchMercadoPagoByAppUserIdAction } from "../../core/actions/PatchMercadoPagoByAppUserIdAction.js";
import { ILinkSubscriptionForAppUserAction } from "../../core/actions/LinkSubscriptionForAppUserAction.js";

const adminIdFromReq = (req: Request): number => {
  const id = Number((req as any).auth?.id);
  if (!Number.isFinite(id)) {
    throw new Error("Admin no identificado");
  }
  return id;
};

export const AdminMemberControllers = (
  provision: IProvisionAppUserAndMemberAction,
  getBundle: IGetMemberBundleByAppUserIdAction,
  patchForum: IPatchForumLinkByAppUserIdAction,
  patchMp: IPatchMercadoPagoByAppUserIdAction,
  linkSub: ILinkSubscriptionForAppUserAction
) => ({
  provision(req: Request, res: Response) {
    const adminUserId = adminIdFromReq(req);
    provision
      .execute(req.body, adminUserId)
      .then((result) => {
        SuccessResponse(res, 201, "Usuario y miembro interno creados", result);
      })
      .catch((error) => handleMemberError(res, error));
  },
  getByAppUser(req: Request, res: Response) {
    getBundle
      .execute(req.params.appUserId)
      .then((result) => {
        SuccessResponse(res, 200, "Detalle de miembro", result);
      })
      .catch((error) => handleMemberError(res, error));
  },
  patchForum(req: Request, res: Response) {
    const adminUserId = adminIdFromReq(req);
    patchForum
      .execute(req.params.appUserId, req.body, adminUserId)
      .then((result) => {
        SuccessResponse(res, 200, "Foro vinculado", result);
      })
      .catch((error) => handleMemberError(res, error));
  },
  patchMercadoPago(req: Request, res: Response) {
    const adminUserId = adminIdFromReq(req);
    patchMp
      .execute(req.params.appUserId, req.body, adminUserId)
      .then((result) => {
        SuccessResponse(res, 200, "Mercado Pago actualizado", result);
      })
      .catch((error) => handleMemberError(res, error));
  },
  linkSubscription(req: Request, res: Response) {
    const adminUserId = adminIdFromReq(req);
    linkSub
      .execute(req.params.appUserId, req.body, adminUserId)
      .then((result) => {
        SuccessResponse(res, 200, "Suscripción vinculada", result);
      })
      .catch((error) => handleMemberError(res, error));
  },
});

function handleMemberError(res: Response, error: any) {
  if (error instanceof MemberConflictException) {
    return ErrorResponse(res, error, 409);
  }
  if (
    error instanceof UserNotExistException ||
    error instanceof MemberNotFoundException
  ) {
    return ErrorResponse(res, error, 404);
  }
  if (error instanceof UniqueConstraintError) {
    return ErrorResponse(
      res,
      new Error("Email, usuario u otro campo único ya existe"),
      409
    );
  }
  return ErrorResponse(
    res,
    error instanceof Error ? error : new Error(String(error)),
    400
  );
}
