import { DependencyManager } from "../dependencyManager"
import { UserModuleInitializer } from "./users/userModule"
import { AdminUserModuleInitializer } from "./adminUsers/adminUserModule"

const ModulesInitializer = (dependencyManager:DependencyManager) => {
    UserModuleInitializer(dependencyManager)
    AdminUserModuleInitializer(dependencyManager)
}
export default ModulesInitializer