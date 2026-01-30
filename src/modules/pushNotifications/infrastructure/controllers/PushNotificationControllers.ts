import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { IPushNotificationActions } from "../../core/actions/actionsProvider.js";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException.js";
import { PushNotificationNotExistException } from "../../core/exceptions/PushNotificationNotExistException.js";
const name = 'Notificación push'
const pronoun = 'a'
export const PushNotificationControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
  }: IPushNotificationActions) => {
    
  const errorResponses = createHashMap({
    [PushNotificationNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    save(req: Request, res: Response) {
      const saveExecution = save.execute(req.body)
      saveExecution.then(pushNotification => {
        const message=`${name} cread${pronoun} correctamente`
        SuccessResponse(res,201,message,pushNotification)
      }).catch(error => {
        console.error('Error en save push notification:', error instanceof Error ? error.message : error);
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack);
        }
        errorResponses[error.name](res, error) 
      })
    },
    edit(req: Request, res: Response) {
      const editExecution = edit.execute(req.body, req.params.id)
      editExecution.then(pushNotification => {
        const message =`${name} editad${pronoun} correctamente`
        SuccessResponse(res,200,message,pushNotification)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    remove(req: Request, res: Response) {
      const deleteExecution = remove.execute(req.params.id)
      deleteExecution.then(pushNotification => {
        const message = `${name} eliminad${pronoun} correctamente`
        SuccessResponse(res, 200, message, pushNotification)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    get(req: Request, res: Response) {
      const getExecution = getAll.execute(req.query)
      getExecution.then(({pushNotifications, pagination}) => {
        const message = `${name}s obtenid${pronoun}s con exito`
        SuccessResponse(res,200,message,pushNotifications,pagination)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getById(req: Request, res: Response) {
      const getByIdExecution = getById.execute(req.params.id)
      const message=`${name} obtenid${pronoun} con exito`
      getByIdExecution.then(pushNotification => {
        SuccessResponse(res,200,message,pushNotification)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    }
  }
}

