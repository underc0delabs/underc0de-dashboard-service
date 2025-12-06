import { DependencyManager } from "../dependencyManager"
import JwtMiddlewareInitializer from "./jwtValidator/JwtMiddlewareInitalizer"
// We can register global middlewares here

const MiddlewaresInitializer = (dependencyManager:DependencyManager) => {
  JwtMiddlewareInitializer(dependencyManager)
}


export default MiddlewaresInitializer