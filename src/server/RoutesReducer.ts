import { Application } from "express"
import { DependencyManager } from "../dependencyManager.js"
import getUserRoutes from "../modules/users/infrastructure/routes/UserRoutes.js"
import getAdminUserRoutes from "../modules/adminUsers/infrastructure/routes/UserRoutes.js"
import getMerchantRoutes from "../modules/merchants/infrastructure/routes/MerchantRoutes.js"
import getPushNotificationRoutes from "../modules/pushNotifications/infrastructure/routes/PushNotificationRoutes.js"
import getSubscriptionPlanRoutes from "../modules/subscriptionPlan/infrastructure/routes/SubscriptionPlanRoutes.js"
import getPaymentRoutes from "../modules/payment/infrastructure/routes/PaymentRoutes.js"
import getEnvironmentRoutes from "../modules/environments/infrastructure/routes/EnvironmentRoutes.js"
import { CronRoutes } from "../routes/CronRoutes.js"
import getAdminMemberRoutes from "../modules/internalMembers/infrastructure/routes/AdminMemberRoutes.js"
import getPartnerL2Routes from "../modules/partnerL2/infrastructure/routes/PartnerL2Routes.js"
import getCategoryRoutes from "../modules/categories/infrastructure/routes/CategoryRoutes.js"
import getConnectionRoutes from "../modules/connections/infrastructure/routes/ConnectionRoutes.js"
import getRaffleRoutes from "../modules/raffles/infrastructure/routes/RaffleRoutes.js"
import getBingoRoutes from "../modules/bingo/infrastructure/routes/BingoRoutes.js"
import getForumRoutes from "../modules/forum/infrastructure/routes/ForumRoutes.js"
import { ConnectRedirectRoute } from "../routes/ConnectRedirectRoute.js"

const prefix = '/api/v1'
const ReduceRouters = (app: Application, dependencyManager: DependencyManager) => {
    app.use(ConnectRedirectRoute())
    app.use(prefix, getUserRoutes(dependencyManager))
    app.use(prefix, getAdminMemberRoutes(dependencyManager))
    app.use(prefix, getAdminUserRoutes(dependencyManager))
    app.use(prefix, getMerchantRoutes(dependencyManager))
    app.use(prefix, getPushNotificationRoutes(dependencyManager))
    app.use(prefix, getSubscriptionPlanRoutes(dependencyManager))
    app.use(prefix, getPaymentRoutes(dependencyManager))
    app.use(prefix, getEnvironmentRoutes(dependencyManager))
    app.use(prefix, getCategoryRoutes(dependencyManager))
    app.use(prefix, getConnectionRoutes(dependencyManager))
    app.use(prefix, getRaffleRoutes(dependencyManager))
    app.use(prefix, getBingoRoutes(dependencyManager))
    app.use(prefix, getPartnerL2Routes(dependencyManager))
    app.use(prefix, getForumRoutes())
    app.use(prefix + '/cron', CronRoutes(dependencyManager))
}

export default ReduceRouters
