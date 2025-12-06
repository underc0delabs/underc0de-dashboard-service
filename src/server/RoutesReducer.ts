import { DependencyManager } from "../dependencyManager"
import getUserRoutes from "../modules/users/infrastructure/routes/UserRoutes"
import getAdminUserRoutes from "../modules/adminUsers/infrastructure/routes/UserRoutes"
import getMerchantRoutes from "../modules/merchants/infrastructure/routes/MerchantRoutes"
import getPushNotificationRoutes from "../modules/pushNotifications/infrastructure/routes/PushNotificationRoutes"
import getSubscriptionPlanRoutes from "../modules/subscriptionPlan/infrastructure/routes/SubscriptionPlanRoutes"
import getPaymentRoutes from "../modules/payment/infrastructure/routes/PaymentRoutes"

const prefix = '/api/v1'
const ReduceRouters = (app: { use: (arg0: string, arg1: any) => void }, dependencyManager: DependencyManager) => {
    app.use(prefix, getUserRoutes(dependencyManager))
    app.use(prefix, getAdminUserRoutes(dependencyManager))
    app.use(prefix, getMerchantRoutes(dependencyManager))
    app.use(prefix, getPushNotificationRoutes(dependencyManager))
    app.use(prefix, getSubscriptionPlanRoutes(dependencyManager))
    app.use(prefix, getPaymentRoutes(dependencyManager))
}

export default ReduceRouters