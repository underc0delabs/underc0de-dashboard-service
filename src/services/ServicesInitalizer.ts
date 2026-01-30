import { DependencyManager } from "../dependencyManager.js"
import { mercadoPagoServiceInitializer } from "./mercadopagoService/mercadoPagoServiceInitializer.js";
import { pushNotificationModuleInitializer } from "./pushNotificationService/pushNotificationModuleInitializer.js";

const ServicesInitializer = (dependencyManager:DependencyManager) => {
    pushNotificationModuleInitializer(dependencyManager);
    mercadoPagoServiceInitializer(dependencyManager);
}
export default ServicesInitializer