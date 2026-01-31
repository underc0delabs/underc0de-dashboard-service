import admin from "firebase-admin";
import { IFirebaseService } from "../core/iFirebaseService.js";
import { firebaseMessaging } from "./firebaseAdmin.js";

export const firebaseNotificationService = (): IFirebaseService => {
  return {
    async sendNotification(title, message, tokens) {
      /*const validTokens = tokens.filter(
        (t) => typeof t === "string" && t.trim() !== ""
      );

      if (!validTokens.length) {
        return;
      }

      try {
        let messaging;
        try {
          messaging = firebaseMessaging();
        } catch (initError) {
          console.warn(
            "Push notification omitida: Firebase no está inicializado (credenciales faltantes o inválidas).",
            initError instanceof Error ? initError.message : initError
          );
          return;
        }
        
        // Según documentación oficial de Firebase, usar sendEachForMulticast para múltiples tokens
        // y send() para un solo token es más eficiente
        if (validTokens.length === 1) {
          await messaging.send({
            token: validTokens[0],
            notification: {
              title,
              body: message,
            },
            data: {
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }

        const response = await messaging.sendEachForMulticast({
          tokens: validTokens,
          notification: {
            title,
            body: message,
          },
          data: {
            timestamp: new Date().toISOString(),
          },
        });

        if (response.failureCount > 0) {
          const errors = response.responses
            .map((r, i) => {
              if (!r.success) {
                const errorCode = r.error?.code || 'unknown';
                const errorMessage = r.error?.message || 'Error desconocido';
                
                console.error(`Error en token ${i + 1}:`, {
                  code: errorCode,
                  message: errorMessage,
                  error: r.error
                });
                
                if (errorCode === 'messaging/third-party-auth-error') {
                  return `Token ${i + 1}: Error de autenticación de Firebase. Verifica las credenciales y permisos de la cuenta de servicio.`;
                }
                
                return `Token ${i + 1}: ${errorCode} - ${errorMessage}`;
              }
              return null;
            })
            .filter(Boolean);
          
          throw new Error(`Error al enviar notificaciones: ${errors.join(', ')}`);
        }

        if (response.successCount === 0) {
          throw new Error('No se pudo enviar ninguna notificación');
        }
      } catch (error) {
        console.error('Error en firebaseNotificationService.sendNotification:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          error: error
        });
        
        if (error instanceof Error && error.message.includes('third-party-auth-error')) {
          throw new Error('Error de autenticación de Firebase. Verifica que la cuenta de servicio tenga permisos de Cloud Messaging API y que las credenciales sean válidas.');
        }
        throw error;
      } */
    },
  };
};
