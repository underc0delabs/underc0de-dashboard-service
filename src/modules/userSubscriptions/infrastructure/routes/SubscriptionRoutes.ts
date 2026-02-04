import { Router } from "express";
import { DependencyManager } from "../../../../dependencyManager.js";
import { IJwtValidator } from "../../../../middlewares/JwtValidator/core/IJwtValidator.js";
import { SubscriptionControllers } from "../controllers/SubscriptionControllers.js";

const getSubscriptionRoutes = (dependencyManager: DependencyManager) => {
  const jwtValidator = getJwtValidator(dependencyManager);
  const controllers = new SubscriptionControllers();
  
  const router = Router();

  // Endpoint para crear suscripción (requiere autenticación)
  router.post("/subscriptions/create", [jwtValidator], controllers.createSubscription);

  // Endpoint para webhook de MercadoPago (público)
  router.post("/webhook/mercadopago", controllers.handleWebhook);

  return router;
};

const getJwtValidator = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("jwtValidator") as IJwtValidator;
};

export default getSubscriptionRoutes;
