import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { ICategoryActions } from "../../core/actions/actionsProvider.js";
import { CategoryInUseException } from "../../core/exceptions/CategoryInUseException.js";
import { CategoryNotExistException } from "../../core/exceptions/CategoryNotExistException.js";

const name = "Categoría";
const pronoun = "a";

export const CategoryControllers = ({
  save,
  edit,
  remove,
  getAll,
  getById,
}: ICategoryActions) => {
  const errorResponses = createHashMap(
    {
      [CategoryNotExistException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
      [CategoryInUseException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 409),
    },
    (res: Response, error: Error) => ErrorResponse(res, error),
  ) as Record<string, (res: Response, error: Error) => void>;

  return {
    save(req: Request, res: Response) {
      save
        .execute(req.body)
        .then((category) => {
          SuccessResponse(res, 201, `${name} cread${pronoun} correctamente`, category);
        })
        .catch((error) => {
          if (errorResponses[error?.name]) {
            errorResponses[error.name](res, error);
            return;
          }
          ErrorResponse(
            res,
            error instanceof Error ? error : new Error(String(error)),
          );
        });
    },
    edit(req: Request, res: Response) {
      edit
        .execute(req.body, req.params.id)
        .then((category) => {
          SuccessResponse(res, 200, `${name} editad${pronoun} correctamente`, category);
        })
        .catch((error) => {
          if (errorResponses[error?.name]) {
            errorResponses[error.name](res, error);
            return;
          }
          ErrorResponse(
            res,
            error instanceof Error ? error : new Error(String(error)),
          );
        });
    },
    remove(req: Request, res: Response) {
      remove
        .execute(req.params.id)
        .then((category) => {
          SuccessResponse(res, 200, `${name} eliminad${pronoun} correctamente`, category);
        })
        .catch((error) => {
          if (errorResponses[error?.name]) {
            errorResponses[error.name](res, error);
            return;
          }
          ErrorResponse(
            res,
            error instanceof Error ? error : new Error(String(error)),
          );
        });
    },
    get(req: Request, res: Response) {
      getAll
        .execute(req.query as Record<string, unknown>)
        .then(({ categories }) => {
          SuccessResponse(
            res,
            200,
            `${name}s obtenid${pronoun}s con exito`,
            categories,
          );
        })
        .catch((error) => {
          if (errorResponses[error?.name]) {
            errorResponses[error.name](res, error);
            return;
          }
          ErrorResponse(
            res,
            error instanceof Error ? error : new Error(String(error)),
          );
        });
    },
    getById(req: Request, res: Response) {
      getById
        .execute(req.params.id)
        .then((category) => {
          SuccessResponse(res, 200, `${name} obtenid${pronoun} con exito`, category);
        })
        .catch((error) => {
          if (errorResponses[error?.name]) {
            errorResponses[error.name](res, error);
            return;
          }
          ErrorResponse(
            res,
            error instanceof Error ? error : new Error(String(error)),
          );
        });
    },
  };
};
