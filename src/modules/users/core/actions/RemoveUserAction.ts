import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { InvalidIdException } from "../exceptions/InvalidIdException.js";

export interface IRemoveUserAction {
    execute: (id:string) => Promise<any>
}

export const RemoveUserAction = (UserRepository: IUserRepository):IRemoveUserAction => {
    return {
        execute(id) {
            return new Promise(async (resolve, reject) => {
                try {
                  const user = await UserRepository.getById(id)
                  if (!user) throw new UserNotExistException()
                  await UserRepository.remove(id)
                  resolve(user)
                } catch (error) {
                  reject(error)
                }
              })
        },
    }
}