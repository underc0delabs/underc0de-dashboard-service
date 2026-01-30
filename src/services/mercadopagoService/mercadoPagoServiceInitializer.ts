import { DependencyManager } from "../../dependencyManager.js";
import { MercadoPagoHttpGateway } from "./infrastructure/gateway/mercadoPagoHttpGateway.js"; 
import { MercadoPagoSyncService } from "./infrastructure/service/mercadoPagoSyncService.js";

export const mercadoPagoServiceInitializer = (dependencyManager: DependencyManager) => {
    const mercadoPagoGateway = MercadoPagoHttpGateway();
    const mercadoPagoSyncService = MercadoPagoSyncService(mercadoPagoGateway);
    dependencyManager.register('mercadoPagoSyncService', mercadoPagoSyncService);
}