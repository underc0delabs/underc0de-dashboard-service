import { IUserRepository } from "../repository/IMongoUserRepository";
export interface IGetOneUserAction {
    execute: (query:object) => Promise<any>
}
export const GetOneUserAction = (UserRepository: IUserRepository):IGetOneUserAction => {
    return {
        execute(query) {
          return new Promise(async (resolve, reject) => {
            try {
              const user = await UserRepository.getOne(query)
              resolve(user)
            } catch (error) {
              reject(error)
            }
          })
        },
    }
}