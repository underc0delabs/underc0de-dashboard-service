import { DependencyManager } from "../dependencyManager.js"
import getUserRoutes from "../modules/users/infrastructure/routes/UserRoutes.js"
import getAdminUserRoutes from "../modules/adminUsers/infrastructure/routes/UserRoutes.js"
import getMerchantRoutes from "../modules/merchants/infrastructure/routes/MerchantRoutes.js"
import getPushNotificationRoutes from "../modules/pushNotifications/infrastructure/routes/PushNotificationRoutes.js"
import getSubscriptionPlanRoutes from "../modules/subscriptionPlan/infrastructure/routes/SubscriptionPlanRoutes.js"
import getPaymentRoutes from "../modules/payment/infrastructure/routes/PaymentRoutes.js"
import { CronRoutes } from "../routes/CronRoutes.js"
import getSubscriptionRoutes from "../modules/userSubscriptions/infrastructure/routes/SubscriptionRoutes.js"

const prefix = '/api/v1'
const ReduceRouters = (app: { use: (arg0: string, arg1: any) => void }, dependencyManager: DependencyManager) => {
    app.use(prefix, getUserRoutes(dependencyManager))
    app.use(prefix, getAdminUserRoutes(dependencyManager))
    app.use(prefix, getMerchantRoutes(dependencyManager))
    app.use(prefix, getPushNotificationRoutes(dependencyManager))
    app.use(prefix, getSubscriptionPlanRoutes(dependencyManager))
    app.use(prefix, getPaymentRoutes(dependencyManager))
    app.use(prefix, getSubscriptionRoutes(dependencyManager))
    app.use(prefix + '/cron', CronRoutes(dependencyManager))
}

export default ReduceRouters
