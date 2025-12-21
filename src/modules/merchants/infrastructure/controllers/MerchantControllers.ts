import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api";
import { createHashMap } from "../../../../helpers/utils";
import { IMerchantActions } from "../../core/actions/actionsProvider";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException";
import { MerchantNotExistException } from "../../core/exceptions/MerchantNotExistException";
const name = 'Comercio'
const pronoun = 'o'
export const MerchantControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
  }: IMerchantActions) => {
    
  const errorResponses = createHashMap({
    [MerchantNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    save(req: Request, res: Response) {
      const file = (req as any).file;
      const saveExecution = save.execute(req.body, file)
      saveExecution.then(merchant => {
        const message=`${name} cread${pronoun} correctamente`
        SuccessResponse(res,201,message,merchant)
      }).catch(error => {
        errorResponses[error.name](res, error) 
      })
    },
    edit(req: Request, res: Response) {
      const file = (req as any).file;
      const editExecution = edit.execute(req.body, req.params.id, file)
      editExecution.then(merchant => {
        const message =`${name} editad${pronoun} correctamente`
        SuccessResponse(res,200,message,merchant)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    remove(req: Request, res: Response) {
      const deleteExecution = remove.execute(req.params.id)
      deleteExecution.then(merchant => {
        const message = `${name} eliminad${pronoun} correctamente`
        SuccessResponse(res, 200, message, merchant)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    get(req: Request, res: Response) {
      const getExecution = getAll.execute(req.query)
      getExecution.then(({merchants, pagination}) => {
        const message = `${name}s obtenid${pronoun}s con exito`
        SuccessResponse(res,200,message,merchants,pagination)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    getById(req: Request, res: Response) {
      const getByIdExecution = getById.execute(req.params.id)
      const message=`${name} obtenid${pronoun} con exito`
      getByIdExecution.then(merchant => {
        SuccessResponse(res,200,message,merchant)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    }
  }
}

