import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../../../../helpers/api.js";
import { createHashMap } from "../../../../helpers/utils.js";
import { ISubscriptionPlanActions } from "../../core/actions/actionsProvider.js";
import { InvalidIdException } from "../../core/exceptions/InvalidIdException.js";
import { SubscriptionPlanNotExistException } from "../../core/exceptions/SubscriptionPlanNotExistException.js";

const SUBSCRIPTION_SUCCESS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="1;url=underc0de://subscriptions/success"><title>Pago completado</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem;"><h1>Pago completado</h1><p>Volviendo a la app...</p><script>setTimeout(function(){window.location.href="underc0de://subscriptions/success";},800);</script></body></html>`;

const name = 'Plan de suscripción'
const pronoun = 'o'
export const SubscriptionPlanControllers = ({
    save,
    edit,
    remove,
    getAll,
    getById,
    syncMercadoPago,
    createSubscription,
    confirmSubscription,
    syncSubscriptionByPreapprovalId,
    refreshSubscriptionStatus,
  }: ISubscriptionPlanActions) => {
    
  const errorResponses = createHashMap({
    [SubscriptionPlanNotExistException.name]: (res:Response, error: Error) => ErrorResponse(res,error,404),
    [InvalidIdException.name]:(res:Response, error: Error) => ErrorResponse(res,error,400),
  }, (res:Response, error: Error,) => ErrorResponse(res,error)) as any
  return {
    createSubscription(req: Request, res: Response) {
      const auth = (req as any).auth;
      if (!auth?.id) {
        return ErrorResponse(res, new Error("No hay token en la petición") as any, 401);
      }
      const body = (req.body || {}) as { mercadopago_email?: string };
      const mercadopagoEmail = typeof body.mercadopago_email === "string"
        ? body.mercadopago_email.trim() || undefined
        : undefined;
      const saveExecution = createSubscription.execute({
        userId: auth.id,
        mercadopagoEmail,
      });
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
        errorResponses[error.name](res, error)
      })
    },
    confirmSubscription(req: Request, res: Response) {
      const confirmExecution = confirmSubscription.execute(req.body)
      confirmExecution.then(result => {
        const message = "Suscripción confirmada"
        SuccessResponse(res, 200, message, result)
      }).catch(error => {
        errorResponses[error.name](res, error)
      })
    },
    handleWebhook(req: Request, res: Response) {
      confirmSubscription.execute(req.body)
        .then(() => res.status(200).json({ received: true }))
        .catch((error) => {
          console.error('[webhook/mercadopago] Error processing webhook:', error?.message ?? error);
          res.status(200).json({ received: true });
        });
    },
    refreshSubscriptionStatus(req: Request, res: Response) {
      const auth = (req as any).auth;
      if (!auth?.id) {
        return ErrorResponse(res, new Error("No autorizado") as any, 401);
      }
      const body = (req.body || {}) as { preapproval_id?: string };
      const preapproval_id = typeof body.preapproval_id === "string"
        ? body.preapproval_id.trim() || undefined
        : undefined;
      refreshSubscriptionStatus
        .execute({ userId: auth.id, preapproval_id })
        .then((result) => {
          if (result.success) {
            SuccessResponse(res, 200, "Estado actualizado", result);
          } else {
            ErrorResponse(res, new Error(result.message ?? "Error al sincronizar") as any, 400);
          }
        })
        .catch((error) => {
          errorResponses[error?.name] ? errorResponses[error.name](res, error) : ErrorResponse(res, error, 500);
        });
    },
    async subscriptionSuccess(req: Request, res: Response) {
      const preapprovalId =
        (req.query?.preapproval_id as string)?.trim() ||
        (req.query?.id as string)?.trim();

      if (preapprovalId) {
        const syncPromise = syncSubscriptionByPreapprovalId.execute(preapprovalId);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sync timeout")), 5000)
        );
        await Promise.race([syncPromise, timeoutPromise]).catch((err) => {
          console.warn("[subscriptions/success] Sync failed:", err?.message ?? err);
        });
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(SUBSCRIPTION_SUCCESS_HTML);
    }
  }
}

