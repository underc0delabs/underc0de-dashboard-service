import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api";
import { createHashMap } from "../../../../helpers/utils";
import { ISubscriptionPlanActions } from "../../core/actions/actionsProvider";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException";
import { SubscriptionPlanNotExistException } from "../../core/exceptions/SubscriptionPlanNotExistException";
const name = 'Plan de suscripción'
const pronoun = 'o'
export const SubscriptionPlanControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
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
        console.log(error)
        errorResponses[error.name](res, error)
      })
    }
  }
}

