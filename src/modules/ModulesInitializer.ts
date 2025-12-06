import { DependencyManager } from "../dependencyManager"
import { UserModuleInitializer } from "./users/userModule"
import { AdminUserModuleInitializer } from "./adminUsers/adminUserModule"
import { MerchantModuleInitializer } from "./merchants/merchantModule"
import { PushNotificationModuleInitializer } from "./pushNotifications/pushNotificationModule"
import { SubscriptionPlanModuleInitializer } from "./subscriptionPlan/subscriptionPlanModule"
import { PaymentModuleInitializer } from "./payment/paymentModule"

const ModulesInitializer = (dependencyManager:DependencyManager) => {
    UserModuleInitializer(dependencyManager)
    AdminUserModuleInitializer(dependencyManager)
    MerchantModuleInitializer(dependencyManager)
    PushNotificationModuleInitializer(dependencyManager)
    SubscriptionPlanModuleInitializer(dependencyManager)
    PaymentModuleInitializer(dependencyManager)
}
export default ModulesInitializer