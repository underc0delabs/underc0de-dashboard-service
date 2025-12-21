import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api";
import { createHashMap } from "../../../../helpers/utils";
import { IUserActions } from "../../core/actions/actionsProvider";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException";
import { UserNotActiveException } from "../../core/exceptions/UserNotActiveException";
import { UserNotExistException } from "../../core/exceptions/UserNotExistException";
import { WrongCredentialsException } from "../../core/exceptions/WrongCredentialsException";
const name = 'Usuario'
const pronoun = 'o'
export const UserControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
    login,
    saveFcmToken,
    getMetrics
  }: IUserActions) => {
    
  const errorResponses = createHashMap({
    [UserNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [UserNotActiveException.name]: (res:Response, error: Error) => ErrorResponse(res,error,409),
    [WrongCredentialsException.name]:(res:Response, error: Error) => ErrorResponse(res,error,401),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    save(req: Request, res: Response) {
      const saveExecution = save.execute(req.body)
      saveExecution.then(user => {
        const message=`${name} cread${pronoun} correctamente`
        SuccessResponse(res,201,message,user)
      }).catch(error => {
        errorResponses[error.name](res, error) 
      })
    },
    edit(req: Request, res: Response) {
      const editExecution = edit.execute(req.body, req.params.id)
      editExecution.then(user => {
        const message =`${name} editad${pronoun} correctamente`
        SuccessResponse(res,200,message,user)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    remove(req: Request, res: Response) {
      const deleteExecution = remove.execute(req.params.id)
      deleteExecution.then(user => {
        const message = `${name} eliminad${pronoun} correctamente`
        SuccessResponse(res, 200, message, user)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    get(req: Request, res: Response) {
      const getExecution = getAll.execute(req.query)
      getExecution.then(({users}) => {
        const message = `${name}s obtenid${pronoun}s con exito`
        SuccessResponse(res,200,message,users)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getById(req: Request, res: Response) {
      const getByIdExecution = getById.execute(req.params.id)
      const message=`${name} obtenid${pronoun} con exito`
      getByIdExecution.then(user => {
        SuccessResponse(res,200,message,user)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    login(req: Request, res: Response) {
      const loginExecution = login.execute(req.body)
      const message = "Inicio de sesión exitoso"
      loginExecution.then(result => {
        SuccessResponse(res,200,message,result)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    saveFcmToken(req: Request, res: Response) {
      const saveFcmTokenExecution = saveFcmToken.execute(req.body)
      saveFcmTokenExecution.then(user => {
        const message = `${name} fcm token guardado correctamente`
        SuccessResponse(res,200,message,user)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getMetrics(req: Request, res: Response) {
      const getMetricsExecution = getMetrics.execute()
      getMetricsExecution.then(metrics => {
        SuccessResponse(res,200,"Métricas obtenidas correctamente",metrics)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    }
  }
}