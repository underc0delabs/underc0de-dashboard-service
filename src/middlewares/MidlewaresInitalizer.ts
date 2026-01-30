import { DependencyManager } from "../dependencyManager.js"
import JwtMiddlewareInitializer from "./JwtValidator/JwtMiddlewareInitalizer.js"
// We can register global middlewares here

const MiddlewaresInitializer = (dependencyManager:DependencyManager) => {
  JwtMiddlewareInitializer(dependencyManager)
}


export default MiddlewaresInitializer