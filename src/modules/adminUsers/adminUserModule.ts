import { DependencyManager } from "../../dependencyManager.js";
import { AdminUserRepository } from "./infrastructure/repository/AdminUserRepository.js";

export const AdminUserModuleInitializer = (dependencyManager: DependencyManager) => {
    const adminUserRepository = AdminUserRepository()
    dependencyManager.register('adminUserRepository', adminUserRepository)
}