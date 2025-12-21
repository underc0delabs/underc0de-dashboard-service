import { DependencyManager } from "../dependencyManager"
import { FirebaseNotificationService } from "./pushNotificationService/service/firebaseNotificationService";

const ServicesInitializer = (dependencyManager:DependencyManager) => {
    dependencyManager.register('firebaseService', FirebaseNotificationService);
}
export default ServicesInitializer