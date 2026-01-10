import { DependencyManager } from "../dependencyManager"
import { mercadoPagoServiceInitializer } from "./mercadopagoService/mercadoPagoServiceInitializer";
import { pushNotificationModuleInitializer } from "./pushNotificationService/pushNotificationModuleInitializer";

const ServicesInitializer = (dependencyManager:DependencyManager) => {
    pushNotificationModuleInitializer(dependencyManager);
    mercadoPagoServiceInitializer(dependencyManager);
}
export default ServicesInitializer