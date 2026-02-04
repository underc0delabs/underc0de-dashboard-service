import { Request, Response } from "express";
import { CreateSubscriptionService } from "../../core/services/CreateSubscriptionService.js";
import { MercadoPagoWebhookService } from "../../core/services/MercadoPagoWebhookService.js";

export class SubscriptionControllers {
  private createSubscriptionService: CreateSubscriptionService;
  private webhookService: MercadoPagoWebhookService;

  constructor() {
    this.createSubscriptionService = new CreateSubscriptionService();
    this.webhookService = new MercadoPagoWebhookService();
  }

  createSubscription = async (req: Request, res: Response) => {
    try {
      // @ts-ignore - user es agregado por el middleware jwtValidator
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          status: 401,
          success: false,
          msg: "Usuario no autenticado",
          result: null,
        });
      }

      const result = await this.createSubscriptionService.execute(user);

      res.status(200).json({
        status: 200,
        success: true,
        msg: "Suscripción creada exitosamente",
        result,
      });
    } catch (error) {
      console.error("[CREATE SUBSCRIPTION] Error:", error);
      
      res.status(500).json({
        status: 500,
        success: false,
        msg: error instanceof Error ? error.message : "Error al crear suscripción",
        result: null,
      });
    }
  };

  handleWebhook = async (req: Request, res: Response) => {
    try {
      console.log("[MP WEBHOOK CONTROLLER] Received webhook");
      
      const result = await this.webhookService.handleWebhook(req.body);

      // MercadoPago espera un 200 siempre, incluso si no procesamos el evento
      res.status(200).json(result);
    } catch (error) {
      console.error("[MP WEBHOOK CONTROLLER] Error:", error);
      
      // Incluso con error, respondemos 200 para que MP no reintente
      res.status(200).json({
        success: false,
        message: error instanceof Error ? error.message : "Error processing webhook",
      });
    }
  };
}
