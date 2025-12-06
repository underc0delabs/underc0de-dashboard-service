import { Application } from "express";
import { DependencyManager } from "./dependencyManager";
import MiddlewaresInitializer from "./middlewares/MidlewaresInitalizer";
import ModulesInitializer from "./modules/ModulesInitializer";
import ConnectToDatabase from "./server/DbConnection";
import ConfigureServerMiddlewares from "./server/MiddlewaresConfig";
import ReduceRouters from "./server/RoutesReducer";
import InitializeServer from "./server/ServerInitializer";
import ServicesInitializer from "./services/ServicesInitalizer";

const dependencyManager = new DependencyManager()

const app:Application = InitializeServer()

ConnectToDatabase()

ConfigureServerMiddlewares(app)

ServicesInitializer(dependencyManager)

ModulesInitializer(dependencyManager)

MiddlewaresInitializer(dependencyManager)

ReduceRouters(app,dependencyManager)

app.get("/health", (_req, res) => res.status(200).send("ok"));
