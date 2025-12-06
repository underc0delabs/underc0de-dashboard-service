import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager'
import { IJwtValidator } from '../../../../middlewares/jwtValidator/core/IJwtValidator'
import { getAdminUserControllers } from '../controllers/controllersProvider'

const getUserRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById,login} = getAdminUserControllers(dependencyManager)
    const userRouter = Router()
    const path = 'admin-users'

    userRouter.post(`/login`, login)
    userRouter.post(`/${path}`,[jwtValidator], save)
    userRouter.get(`/${path}`,[jwtValidator], get)
    userRouter.get(`/${path}/:id`,[jwtValidator], getById)
    userRouter.patch(`/${path}/:id`,[jwtValidator], edit)
    userRouter.delete(`/${path}/:id`,[jwtValidator], remove)

    return userRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getUserRoutes
