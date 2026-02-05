import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { IEnvironmentActions } from "../../core/actions/actionsProvider.js";
import { EnvironmentNotExistException } from "../../core/exceptions/EnvironmentNotExistException.js";

const name = "Variable de entorno";
const pronoun = "a";

export const EnvironmentControllers = ({
  getEnvironment,
  updateEnvironment,
}: IEnvironmentActions) => {
  const errorResponses = createHashMap(
    {
      [EnvironmentNotExistException.name]: (res: Response, error: Error) =>
        ErrorResponse(res, error, 404),
    },
    (res: Response, error: Error) => ErrorResponse(res, error)
  ) as any;

  return {
    getEnvironment(req: Request, res: Response) {
      const key = req.params.key;
      const getExecution = getEnvironment.execute(key);
      getExecution
        .then((environment) => {
          const message = `${name} obtenid${pronoun} con éxito`;
          SuccessResponse(res, 200, message, environment);
        })
        .catch((error) => {
          errorResponses[error.name](res, error);
        });
    },

    updateEnvironment(req: Request, res: Response) {
      const key = req.params.key;
      const { value } = req.body;

      if (!value) {
        return ErrorResponse(res, new Error("El campo 'value' es requerido"), 400);
      }

      const updateExecution = updateEnvironment.execute(key, value);
      updateExecution
        .then((environment) => {
          const message = `${name} actualizad${pronoun} correctamente`;
          SuccessResponse(res, 200, message, environment);
        })
        .catch((error) => {
          errorResponses[error.name](res, error);
        });
    },
  };
};
