import { IFirebaseService } from "../core/iFirebaseService";
import admin from "firebase-admin";
import serviceAccount from "../../../../underc0de-f1e15-firebase-adminsdk-srum9-7b91cfffa4.json";

export const FirebaseNotificationService = (): IFirebaseService => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  const firebaseMessaging = admin.messaging();

  return {
    async sendNotification(
      title: string,
      message: string,
      tokens: string[]
    ): Promise<void> {
      await firebaseMessaging.sendEachForMulticast({
        tokens: tokens,
        notification: {
          title: title,
          body: message,
        },
      });
    },
  };
};
