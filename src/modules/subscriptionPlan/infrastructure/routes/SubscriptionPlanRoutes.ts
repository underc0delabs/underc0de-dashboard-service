import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager.js'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator.js'
import { getSubscriptionPlanControllers } from '../controllers/controllersProvider.js'

const getSubscriptionPlanRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById, syncMercadoPago} = getSubscriptionPlanControllers(dependencyManager)
    const subscriptionPlanRouter = Router()
    const path = 'subscription-plans'

    subscriptionPlanRouter.post(`/${path}`,[jwtValidator], save)
    subscriptionPlanRouter.get(`/${path}`,[jwtValidator], get)
    subscriptionPlanRouter.get(`/${path}/sync-mercadopago`,[jwtValidator], syncMercadoPago)

    return subscriptionPlanRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getSubscriptionPlanRoutes

