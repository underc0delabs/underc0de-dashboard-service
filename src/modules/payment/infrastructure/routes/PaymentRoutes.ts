import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager'
import { IJwtValidator } from '../../../../middlewares/jwtValidator/core/IJwtValidator'
import { getPaymentControllers } from '../controllers/controllersProvider'

const getPaymentRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById} = getPaymentControllers(dependencyManager)
    const paymentRouter = Router()
    const path = 'payments'

    paymentRouter.post(`/${path}`,[jwtValidator], save)
    paymentRouter.get(`/${path}`,[jwtValidator], get)
    paymentRouter.get(`/${path}/:id`,[jwtValidator], getById)
    paymentRouter.patch(`/${path}/:id`,[jwtValidator], edit)
    paymentRouter.delete(`/${path}/:id`,[jwtValidator], remove)

    return paymentRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getPaymentRoutes

