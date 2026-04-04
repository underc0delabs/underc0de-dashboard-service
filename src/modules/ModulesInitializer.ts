import { DependencyManager } from "../dependencyManager.js"
import { UserModuleInitializer } from "./users/userModule.js"
import { AdminUserModuleInitializer } from "./adminUsers/adminUserModule.js"
import { MerchantModuleInitializer } from "./merchants/merchantModule.js"
import { PushNotificationModuleInitializer } from "./pushNotifications/pushNotificationModule.js"
import { SubscriptionPlanModuleInitializer } from "./subscriptionPlan/subscriptionPlanModule.js"
import { PaymentModuleInitializer } from "./payment/paymentModule.js"
import { EnvironmentModule } from "./environments/environmentModule.js"
import { InternalMemberModuleInitializer } from "./internalMembers/internalMemberModule.js"

const ModulesInitializer = (dependencyManager:DependencyManager) => {
    UserModuleInitializer(dependencyManager)
    AdminUserModuleInitializer(dependencyManager)
    MerchantModuleInitializer(dependencyManager)
    PushNotificationModuleInitializer(dependencyManager)
    SubscriptionPlanModuleInitializer(dependencyManager)
    PaymentModuleInitializer(dependencyManager)
    InternalMemberModuleInitializer(dependencyManager)
    EnvironmentModule(dependencyManager)
}
export default ModulesInitializer