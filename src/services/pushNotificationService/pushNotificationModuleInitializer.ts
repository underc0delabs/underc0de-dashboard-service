import { DependencyManager } from "../../dependencyManager";
import { FirebaseNotificationService } from "./service/firebaseNotificationService";

export const pushNotificationModuleInitializer = (
  dependencyManager: DependencyManager
) => {
  const pushNotificationService = FirebaseNotificationService();
  dependencyManager.register(
    "pushNotificationService",
    pushNotificationService
  );
};
