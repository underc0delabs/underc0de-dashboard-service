import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager.js'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator.js'
import { validateMercadoPagoWebhook } from '../../../../middlewares/MercadoPagoWebhookValidator/validateMercadoPagoWebhook.js'
import { getSubscriptionPlanControllers } from '../controllers/controllersProvider.js'

const getSubscriptionPlanRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {createSubscription, get, syncMercadoPago, confirmSubscription, subscriptionSuccess, handleWebhook, refreshSubscriptionStatus, cancelUserSubscription} = getSubscriptionPlanControllers(dependencyManager)
    const subscriptionPlanRouter = Router()
    const path = 'subscription-plans'

    subscriptionPlanRouter.get(`/subscriptions/success`, subscriptionSuccess)
    subscriptionPlanRouter.post(`/subscriptions/create`, [jwtValidator], createSubscription)
    subscriptionPlanRouter.post(`/subscriptions/cancel`, [jwtValidator], cancelUserSubscription)
    subscriptionPlanRouter.get(`/${path}`,[jwtValidator], get)
    subscriptionPlanRouter.get(`/${path}/sync-mercadopago`,[jwtValidator], syncMercadoPago)
    subscriptionPlanRouter.post(`/subscriptions/confirm`, confirmSubscription)
    subscriptionPlanRouter.post(`/subscriptions/refresh-status`, [jwtValidator], refreshSubscriptionStatus)
    subscriptionPlanRouter.post(`/webhook/mercadopago`, [validateMercadoPagoWebhook], handleWebhook)

    return subscriptionPlanRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getSubscriptionPlanRoutes

