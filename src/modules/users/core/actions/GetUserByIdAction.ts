import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";
export interface IGetUserByIdAction {
    execute: (id:string) => Promise<any>
}
export const GetUserByIdAction = (UserRepository: IUserRepository):IGetUserByIdAction => {
    return {
        execute(id) {
          return new Promise(async (resolve, reject) => {
            try {
              const user = await UserRepository.getById(id)
              if(!user) throw new UserNotExistException()
              resolve(user)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}