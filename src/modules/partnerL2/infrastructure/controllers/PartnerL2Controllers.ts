import { Request, Response } from "express";

import { SuccessResponse, ErrorResponse } from "../../../../helpers/api.js";
import {
  finalizeL2ForumLink,
  createLookupForumUsernameForL2Action,
} from "../../core/actions/partnerForumActions.js";
import type { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import L2PartnerForumLink from "../models/L2PartnerForumLinkModel.js";

export const PartnerL2Controllers = (deps: {
  userRepository: IUserRepository;
}) => {
  const lookup = createLookupForumUsernameForL2Action(deps.userRepository);

  return {
    getUsernameStatus(req: Request, res: Response) {
      const q = req.query.memberName ?? req.query.q ?? req.query.username;
      const raw =
        typeof q === "string"
          ? q
          : Array.isArray(q) && typeof q[0] === "string"
            ? q[0]
            : "";
      lookup
        .execute(raw)
        .then((data) =>
          SuccessResponse(res, 200, "Consulta realizada correctamente", data)
        )
        .catch((err: Error & { statusCode?: number }) =>
          ErrorResponse(
            res,
            err instanceof Error ? err : new Error(String(err)),
            err.statusCode ?? 400
          )
        );
    },

    postFinalizeForumLink(req: Request, res: Response) {
      const body = req.body as {
        l2AccountId?: string;
        forumJwt?: string;
      };
      finalizeL2ForumLink({
        l2UserExternalId: body.l2AccountId ?? "",
        forumJwt: body.forumJwt ?? "",
      })
        .then((row) =>
          SuccessResponse(res, 200, "Cuenta vinculada con Underc0de / foro", row)
        )
        .catch((err: Error & { statusCode?: number }) =>
          ErrorResponse(
            res,
            err instanceof Error ? err : new Error(String(err)),
            err.statusCode ?? 400
          )
        );
    },

    async getForumLinkStatus(req: Request, res: Response) {
      try {
        const id = req.params.l2AccountId?.trim?.();
        if (!id) {
          return ErrorResponse(res, new Error("l2AccountId requerido"), 400);
        }
        const row = await L2PartnerForumLink.findOne({
          where: { l2UserExternalId: id },
        });
        if (!row) {
          return SuccessResponse(res, 200, "Sin vínculo L2 ↔ foro", {
            linked: false,
          });
        }
        const plain = row as { toJSON?: () => object };
        return SuccessResponse(res, 200, "Vínculo encontrado", {
          linked: true,
          ...(plain.toJSON?.() ?? {}),
        });
      } catch (e) {
        return ErrorResponse(res, e instanceof Error ? e : new Error(String(e)));
      }
    },
  };
};
