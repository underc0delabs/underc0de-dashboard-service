import { DependencyManager } from "../../dependencyManager";
import { firebaseNotificationService } from "./service/firebaseNotificationService";

export const pushNotificationModuleInitializer = (
  dependencyManager: DependencyManager
) => {
  const pushNotificationService = firebaseNotificationService();
  dependencyManager.register(
    "pushNotificationService",
    pushNotificationService
  );
};
