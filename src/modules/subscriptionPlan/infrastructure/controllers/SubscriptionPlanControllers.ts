import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { ISubscriptionPlanActions } from "../../core/actions/actionsProvider.js";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException.js";
import { SubscriptionPlanNotExistException } from "../../core/exceptions/SubscriptionPlanNotExistException.js";
const name = 'Plan de suscripción'
const pronoun = 'o'
export const SubscriptionPlanControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
    syncMercadoPago,
  }: ISubscriptionPlanActions) => {
    
  const errorResponses = createHashMap({
    [SubscriptionPlanNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    save(req: Request, res: Response) {
      const saveExecution = save.execute(req.body)
      saveExecution.then(subscriptionPlan => {
        const message=`${name} cread${pronoun} correctamente`
        SuccessResponse(res,201,message,subscriptionPlan)
      }).catch(error => {
        errorResponses[error.name](res, error) 
      })
    },
    edit(req: Request, res: Response) {
      const editExecution = edit.execute(req.body, req.params.id)
      editExecution.then(subscriptionPlan => {
        const message =`${name} editad${pronoun} correctamente`
        SuccessResponse(res,200,message,subscriptionPlan)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    remove(req: Request, res: Response) {
      const deleteExecution = remove.execute(req.params.id)
      deleteExecution.then(subscriptionPlan => {
        const message = `${name} eliminad${pronoun} correctamente`
        SuccessResponse(res, 200, message, subscriptionPlan)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    get(req: Request, res: Response) {
      const getExecution = getAll.execute(req.query)
      getExecution.then(({subscriptionPlans, pagination}) => {
        const message = `${name}s obtenid${pronoun}s con exito`
        SuccessResponse(res,200,message,subscriptionPlans,pagination)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getById(req: Request, res: Response) {
      const getByIdExecution = getById.execute(req.params.id)
      const message=`${name} obtenid${pronoun} con exito`
      getByIdExecution.then(subscriptionPlan => {
        SuccessResponse(res,200,message,subscriptionPlan)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    syncMercadoPago(req: Request, res: Response) {
      const syncExecution = syncMercadoPago.execute()
      syncExecution.then(result => {
        const message = "Sincronización de Mercado Pago completada"
        SuccessResponse(res, 200, message, result)
      }).catch(error => {
        console.log("error", error);
        errorResponses[error.name](res, error)
      })
    }
  }
}

