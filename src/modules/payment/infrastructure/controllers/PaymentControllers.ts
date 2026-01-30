import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { IPaymentActions } from "../../core/actions/actionsProvider.js";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException.js";
import { PaymentNotExistException } from "../../core/exceptions/PaymentNotExistException.js";
const name = 'Pago'
const pronoun = 'o'
export const PaymentControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
  }: IPaymentActions) => {
    
  const errorResponses = createHashMap({
    [PaymentNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    save(req: Request, res: Response) {
      const saveExecution = save.execute(req.body)
      saveExecution.then(payment => {
        const message=`${name} cread${pronoun} correctamente`
        SuccessResponse(res,201,message,payment)
      }).catch(error => {
        errorResponses[error.name](res, error) 
      })
    },
    edit(req: Request, res: Response) {
      const editExecution = edit.execute(req.body, req.params.id)
      editExecution.then(payment => {
        const message =`${name} editad${pronoun} correctamente`
        SuccessResponse(res,200,message,payment)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    remove(req: Request, res: Response) {
      const deleteExecution = remove.execute(req.params.id)
      deleteExecution.then(payment => {
        const message = `${name} eliminad${pronoun} correctamente`
        SuccessResponse(res, 200, message, payment)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    get(req: Request, res: Response) {
      const getExecution = getAll.execute(req.query)
      getExecution.then(({payments, pagination}) => {
        const message = `${name}s obtenid${pronoun}s con exito`
        SuccessResponse(res,200,message,payments,pagination)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getById(req: Request, res: Response) {
      const getByIdExecution = getById.execute(req.params.id)
      const message=`${name} obtenid${pronoun} con exito`
      getByIdExecution.then(payment => {
        SuccessResponse(res,200,message,payment)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    }
  }
}

