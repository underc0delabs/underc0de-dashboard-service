import { DependencyManager } from "../../dependencyManager";
import { firebaseNotificationService } from "./service/firebaseNotificationService.js";

export const pushNotificationModuleInitializer = (
  dependencyManager: DependencyManager
) => {
  const pushNotificationService = firebaseNotificationService();
  dependencyManager.register(
    "pushNotificationService",
    pushNotificationService
  );
};
