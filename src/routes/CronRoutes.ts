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
      if (axios.isAxiosError(error) && error.response) {
        status = error.response.status;
        const mpMsg =
          error.response.data?.message ??
          error.response.data?.error ??
          error.response.data?.description;
        if (status === 403) {
          msg = `MercadoPago rechazó la solicitud (403). Revisá que MP_ACCESS_TOKEN en producción sea válido y tenga permisos de lectura. ${mpMsg ? `Detalle: ${mpMsg}` : ""}`;
        } else if (mpMsg) {
          msg = `MercadoPago: ${mpMsg}`;
        }
      }
      const httpStatus = status === 403 ? 403 : 500;
      res.status(httpStatus).json({
        status: httpStatus,
        success: false,
        msg,
        result: null,
      });
    }
  });

  return router;
};
