import { IFirebaseService } from "../../../../services/pushNotificationService/core/iFirebaseService.js";
import IPushNotification from "../entities/IPushNotification.js";
import { IPushNotificationRepository } from "../repository/IPushNotificationRepository.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";

export interface ISavePushNotificationAction {
  execute: (body: IPushNotification) => Promise<any>;
}

export const SavePushNotificationAction = (
  PushNotificationRepository: IPushNotificationRepository,
  firebaseNotificationService: IFirebaseService,
  userRepository: IUserRepository
): ISavePushNotificationAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          let tokens: string | string[] = [];
          
          if (body?.userId != "") {
            const userId = body?.userId ?? '';
            if (!userId) {
              throw new Error('UserId is required for normalUsers audience');
            }
            
            const user = await userRepository.getById(userId);
            if (!user) {
              throw new Error('User not found');
            }
            
            if (user.fcmToken) {
              tokens = user.fcmToken;
            } else {
              tokens = [];
            }
          } else if (body.audience === 'usersPro') {
            const usersResult = await userRepository.get({
              status: true,
              page_count: 10000,
              page_number: 0,
            });
            
            const users = usersResult?.users || [];
            const proUsers = users.filter((user: any) => 
              user.subscription && user.subscription.status === 'ACTIVE'
            );
            
            tokens = proUsers
              .map((user: any) => user.fcmToken)
              .filter((token: string) => token && token.trim() !== '');
          } else if (body.audience === 'todos') {
            const usersResult = await userRepository.get({
              status: true,
              page_count: 10000,
              page_number: 0,
            });
            
            const users = usersResult?.users || [];
            
            tokens = users
              .map((user: any) => user.fcmToken)
              .filter((token: string) => token && token.trim() !== '');
          } else {
            throw new Error(`Invalid audience: ${body.audience}`);
          }

          const tokensArray = Array.isArray(tokens) ? tokens : (tokens ? [tokens] : []);

          if (tokensArray.length > 0) {
            try {
              await firebaseNotificationService.sendNotification(
                body.title,
                body.message,
                tokensArray
              );
            } catch (error) {
              console.error('Error al enviar notificación push:', error instanceof Error ? error.message : error);
              if (error instanceof Error && error.stack) {
                console.error('Stack trace:', error.stack);
              }
              throw error;
            }
          }

          const result = await PushNotificationRepository.save({
            ...body,
            status: tokensArray.length > 0 ? 'sent' : 'pending'
          });
          resolve(result);
        } catch (error) {
          console.error('Error en SavePushNotificationAction:', error instanceof Error ? error.message : error);
          reject(error);
        }
      });
    },
  };
};

