import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator'
import { getMerchantControllers } from '../controllers/controllersProvider'

const getMerchantRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById} = getMerchantControllers(dependencyManager)
    const merchantRouter = Router()
    const path = 'merchants'

    merchantRouter.post(`/${path}`,[jwtValidator], save)
    merchantRouter.get(`/${path}`,[jwtValidator], get)
    merchantRouter.get(`/${path}/:id`,[jwtValidator], getById)
    merchantRouter.patch(`/${path}/:id`,[jwtValidator], edit)
    merchantRouter.delete(`/${path}/:id`,[jwtValidator], remove)

    return merchantRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getMerchantRoutes

