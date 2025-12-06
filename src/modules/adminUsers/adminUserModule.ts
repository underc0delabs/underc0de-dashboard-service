import { DependencyManager } from "../../dependencyManager";
import { AdminUserRepository } from "./infrastructure/repository/AdminUserRepository";

export const AdminUserModuleInitializer = (dependencyManager: DependencyManager) => {
    const adminUserRepository = AdminUserRepository()
    dependencyManager.register('adminUserRepository', adminUserRepository)
}