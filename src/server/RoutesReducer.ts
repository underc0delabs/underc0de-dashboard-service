import { DependencyManager } from "../dependencyManager"
import getUserRoutes from "../modules/users/infrastructure/routes/UserRoutes"
import getAdminUserRoutes from "../modules/adminUsers/infrastructure/routes/UserRoutes"

const prefix = '/api/v1'
const ReduceRouters = (app: { use: (arg0: string, arg1: any) => void }, dependencyManager: DependencyManager) => {
    app.use(prefix, getUserRoutes(dependencyManager))
    app.use(prefix, getAdminUserRoutes(dependencyManager))
}

export default ReduceRouters