import { Application } from "express";
import { DependencyManager } from "./dependencyManager.js";
import MiddlewaresInitializer from "./middlewares/MidlewaresInitalizer.js";
import ModulesInitializer from "./modules/ModulesInitializer.js";
import ConnectToDatabase from "./server/DbConnection.js";
import ConfigureServerMiddlewares from "./server/MiddlewaresConfig.js";
import ReduceRouters from "./server/RoutesReducer.js";
import InitializeServer, { StartServer } from "./server/ServerInitializer.js";
import ServicesInitializer from "./services/ServicesInitalizer.js";
import { startMercadoPagoSyncCron } from "./jobs/mercadoPagoSync.cron.js";
import "./modules/modelsRelations.js";
import { initializeFirebaseAdmin } from "./services/pushNotificationService/service/firebaseAdmin.js";


try {
    const dependencyManager = new DependencyManager()

   /* try {
        initializeFirebaseAdmin()
    } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error instanceof Error ? error.message : error)
    }
*/
    const app:Application = InitializeServer()
    ConnectToDatabase()
    ConfigureServerMiddlewares(app)

    ServicesInitializer(dependencyManager)
    ModulesInitializer(dependencyManager)
    MiddlewaresInitializer(dependencyManager)
    ReduceRouters(app,dependencyManager)
    startMercadoPagoSyncCron(dependencyManager)

    app.get("/health", (_req, res) => res.status(200).send("ok"))
    StartServer(app)
} catch (error) {
    console.error('Error fatal al inicializar el servidor:', error instanceof Error ? error.message : error)
    process.exit(1)
}
