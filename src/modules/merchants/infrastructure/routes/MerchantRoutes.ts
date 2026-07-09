import { Router } from 'express'
import { DependencyManager } from '../../../../dependencyManager.js'
import { IJwtValidator } from '../../../../middlewares/JwtValidator/core/IJwtValidator.js'
import { getMerchantControllers } from '../controllers/controllersProvider.js'
import { withLogoUpload } from '../middlewares/withLogoUpload.js'

const getMerchantRoutes = (dependencyManager: DependencyManager) => {
    const jwtValidator = getJwtValidator(dependencyManager)
    const {save, edit,remove,get, getById} = getMerchantControllers(dependencyManager)
    const merchantRouter = Router()
    const path = 'commerces'

    merchantRouter.post(`/${path}`, [jwtValidator, withLogoUpload], save)
    merchantRouter.get(`/${path}`, get)
    merchantRouter.get(`/${path}/:id`,[jwtValidator], getById)
    merchantRouter.patch(`/${path}/:id`, [jwtValidator, withLogoUpload], edit)
    merchantRouter.delete(`/${path}/:id`,[jwtValidator], remove)

    return merchantRouter
}
const getJwtValidator = (dependencyManager: DependencyManager) => {
    return dependencyManager.resolve('jwtValidator') as IJwtValidator
}

export default getMerchantRoutes

