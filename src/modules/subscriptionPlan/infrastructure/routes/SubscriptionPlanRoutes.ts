import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager.js'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator.js'
import { getSubscriptionPlanControllers } from '../controllers/controllersProvider.js'

const getSubscriptionPlanRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {createSubscription, get, syncMercadoPago, confirmSubscription} = getSubscriptionPlanControllers(dependencyManager)
    const subscriptionPlanRouter = Router()
    const path = 'subscription-plans'

    subscriptionPlanRouter.post(`/subscriptions/create`, createSubscription)
    subscriptionPlanRouter.get(`/${path}`,[jwtValidator], get)
    subscriptionPlanRouter.get(`/${path}/sync-mercadopago`,[jwtValidator], syncMercadoPago)
    subscriptionPlanRouter.post(`/subscriptions/confirm`, confirmSubscription)

    return subscriptionPlanRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getSubscriptionPlanRoutes

