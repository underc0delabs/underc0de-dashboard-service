import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let initialized = false;
let app: admin.app.App | null = null;

export const initializeFirebaseAdmin = () => {
  if (initialized && app) {
    return;
  }

  try {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), "underc0de-f1e15-39bd5639c220.json");

    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(
        `Firebase: credenciales no encontradas en ${serviceAccountPath}. Push notifications deshabilitadas. Para habilitar, define FIREBASE_SERVICE_ACCOUNT_PATH o coloca el JSON en el directorio de la app.`
      );
      return;
    }

    // Eliminar cualquier app existente para evitar conflictos
    try {
      const apps = admin.apps;
      apps.forEach((existingApp) => {
        if (existingApp) {
          existingApp.delete();
        }
      });
    } catch (error) {
      // Ignorar errores al eliminar apps
    }

    // Según la documentación oficial de Firebase y el ejemplo en test.js,
    // la forma más confiable es usar directamente el objeto del service account
    // Firebase Admin SDK maneja internamente la normalización de la clave privada
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountContent);

    // Validar campos requeridos según documentación oficial
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error("El archivo de credenciales no contiene todos los campos requeridos (project_id, client_email, private_key)");
    }

    // Inicializar según documentación oficial de Firebase Admin SDK
    // Especificar explícitamente el projectId es recomendado cuando hay problemas de autenticación
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    if (!app.options.credential) {
      throw new Error("Firebase Admin se inicializó pero no tiene credenciales");
    }

    console.log(`Firebase Admin inicializado para proyecto: ${serviceAccount.project_id}`);
    console.log(`Client email: ${serviceAccount.client_email}`);

    initialized = true;
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    console.warn("El servidor continuará sin push notifications.");
  }
};

export const firebaseMessaging = () => {
  if (!initialized || !app) {
    throw new Error("Firebase Admin no está inicializado. Llama a initializeFirebaseAdmin() primero.");
  }
  
  if (!app.options.credential) {
    throw new Error("Firebase Admin app no tiene credenciales configuradas");
  }
  
  // Usar la app explícitamente para asegurar que se usen las credenciales correctas
  // Esto es crítico según la documentación oficial cuando hay múltiples apps o inicializaciones
  const messaging = admin.messaging(app);
  
  // Verificar que messaging tiene acceso a las credenciales
  if (!messaging) {
    throw new Error("No se pudo obtener instancia de Firebase Messaging");
  }
  
  return messaging;
};
