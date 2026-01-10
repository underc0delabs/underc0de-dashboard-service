import { DependencyManager } from "../../dependencyManager";
import { MercadoPagoHttpGateway } from "./infrastructure/gateway/mercadoPagoHttpGateway"; 
import { MercadoPagoSyncService } from "./infrastructure/service/mercadoPagoSyncService";

export const mercadoPagoServiceInitializer = (dependencyManager: DependencyManager) => {
    const mercadoPagoGateway = MercadoPagoHttpGateway();
    const mercadoPagoSyncService = MercadoPagoSyncService(mercadoPagoGateway);
    dependencyManager.register('mercadoPagoSyncService', mercadoPagoSyncService);
}