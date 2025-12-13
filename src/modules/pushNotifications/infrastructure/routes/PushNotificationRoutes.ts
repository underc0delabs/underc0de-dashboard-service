import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator'
import { getPushNotificationControllers } from '../controllers/controllersProvider'

const getPushNotificationRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById} = getPushNotificationControllers(dependencyManager)
    const pushNotificationRouter = Router()
    const path = 'notifications'

    pushNotificationRouter.post(`/${path}`,[jwtValidator], save)
    pushNotificationRouter.get(`/${path}`,[jwtValidator], get)
    pushNotificationRouter.get(`/${path}/:id`,[jwtValidator], getById)
    pushNotificationRouter.patch(`/${path}/:id`,[jwtValidator], edit)
    pushNotificationRouter.delete(`/${path}/:id`,[jwtValidator], remove)

    return pushNotificationRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getPushNotificationRoutes

