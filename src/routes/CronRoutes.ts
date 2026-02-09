import axios from "axios";
import { Router, Request, Response } from "express";
import { DependencyManager } from "../dependencyManager.js";
import { ISubscriptionPlanRepository } from "../modules/subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { MercadoPagoSyncService } from "../services/mercadopagoService/core/service/mercadoPagoSyncService.js";
import { IPaymentRepository } from "../modules/payment/core/repository/IPaymentRepository.js";
import { IUserRepository } from "../modules/users/core/repository/IMongoUserRepository.js";
import { getSubscriptionPlanActions } from "../modules/subscriptionPlan/core/actions/actionsProvider.js";
import { IEnvironmentRepository } from "../modules/environments/core/repository/IEnvironmentRepository.js";
import { MercadoPagoGateway } from "../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";

export const CronRoutes = (dependencyManager: DependencyManager) => {
  const router = Router();

  /** Debug: llama a MP preapproval/search y devuelve la respuesta cruda para diagnosticar 403 */
  router.get("/mercadopago-debug", async (_req: Request, res: Response) => {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token?.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Falta MP_ACCESS_TOKEN en el entorno",
        result: null,
      });
    }
    try {
      const { data, status } = await axios.get(
        "https://api.mercadopago.com/preapproval/search",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { limit: 1, offset: 0 },
          timeout: 10000,
          validateStatus: () => true,
        }
      );
      const ok = status >= 200 && status < 300;
      return res.status(ok ? 200 : status).json({
        success: ok,
        msg: ok ? "MercadoPago respondió OK" : "MercadoPago devolvió error",
        result: {
          httpStatus: status,
          mpBody: data,
          hint:
            status === 403
              ? "403 = token sin permiso para este recurso, o suscripciones no habilitadas en la app de MP"
              : undefined,
        },
      });
    } catch (err) {
      const e = err as any;
      const status = e.response?.status ?? 500;
      const body = e.response?.data;
      return res.status(status).json({
        success: false,
        msg: e.message || "Error al llamar a MercadoPago",
        result: {
          httpStatus: status,
          mpBody: body,
          hint:
            status === 403
              ? "Revisá en el panel de MP: Credenciales de producción, permisos de la app (suscripciones), que el token sea de la misma app"
              : undefined,
        },
      });
    }
  });

  router.post("/mercadopago-sync", async (req: Request, res: Response) => {
    try {
      console.log("[MP SYNC MANUAL] Iniciando sincronización manual...");

      const subscriptionPlanRepository = dependencyManager.resolve(
        "subscriptionPlanRepository",
      ) as ISubscriptionPlanRepository;
      const mercadoPagoSyncService = dependencyManager.resolve(
        "mercadoPagoSyncService",
      ) as MercadoPagoSyncService;
      const paymentRepository = dependencyManager.resolve(
        "paymentRepository",
      ) as IPaymentRepository;
      const userRepository = dependencyManager.resolve(
        "userRepository",
      ) as IUserRepository;
      const mercadoPagoGateway = dependencyManager.resolve(
        "mercadoPagoGateway",
      ) as MercadoPagoGateway;
      const environmentRepository = dependencyManager.resolve(
        "environmentRepository",
      ) as IEnvironmentRepository;

      const subscriptionPlanActions = getSubscriptionPlanActions(
        subscriptionPlanRepository,
        mercadoPagoSyncService,
        paymentRepository,
        userRepository,
        mercadoPagoGateway,
        environmentRepository,
      );

      await subscriptionPlanActions.syncMercadoPago.execute();

      console.log("[MP SYNC MANUAL] Sincronización completada exitosamente");

      res.status(200).json({
        status: 200,
        success: true,
        msg: "Sincronización de MercadoPago completada exitosamente",
        result: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      console.error("[MP SYNC MANUAL] Error:", error);
      let status = 500;
      let msg =
        error instanceof Error
          ? error.message
          : "Error al ejecutar sincronización";
      let mpBody: unknown = null;
      if (axios.isAxiosError(error) && error.response) {
        status = error.response.status;
        mpBody = error.response.data;
        const mpMsg =
          (error.response.data as any)?.message ??
          (error.response.data as any)?.error ??
          (error.response.data as any)?.description;
        if (status === 403) {
          msg = `MercadoPago rechazó la solicitud (403). Revisá MP_ACCESS_TOKEN y permisos de la app. ${mpMsg ? `Detalle: ${mpMsg}` : ""}`;
        } else if (mpMsg) {
          msg = `MercadoPago: ${mpMsg}`;
        }
      }
      const httpStatus = status === 403 ? 403 : 500;
      res.status(httpStatus).json({
        status: httpStatus,
        success: false,
        msg,
        result: mpBody ? { mpResponse: mpBody } : null,
      });
    }
  });

  return router;
};
