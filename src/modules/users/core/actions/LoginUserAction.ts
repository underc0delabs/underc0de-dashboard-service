import { IUserRepository } from "../repository/IMongoUserRepository";
import generateJWT from "../../../../helpers/generate-jwt";
import { IHashService } from "../services/IHashService";
import { UserNotExistException } from "../exceptions/UserNotExistException";
import { UserNotActiveException } from "../exceptions/UserNotActiveException";
import { WrongCredentialsException } from "../exceptions/WrongCredentialsException";
export interface ILoginUserAction {
    execute: (credentials:{email:string, password:string}) => Promise<any>
}
export const LoginUserAction = (userRepository: IUserRepository, hashService: IHashService):ILoginUserAction => {
    return {
        execute(credentials) {
          return new Promise(async (resolve, reject) => {
            try {
              const user = await userRepository.getOne({email: credentials.email})
              if (!user) throw new UserNotExistException()
              if (!user.status) throw new UserNotActiveException()
              const validPassword = hashService.compare(credentials.password, user.password);
              if (!validPassword) throw new WrongCredentialsException()
              const token = await generateJWT(user.id)
              resolve({
                user,
                token
              })
            } catch (error) {
              reject(error)
            }
          })
        }
    }
}