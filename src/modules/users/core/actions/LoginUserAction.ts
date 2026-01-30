import { IUserRepository } from "../repository/IMongoUserRepository.js";
import generateJWT from "../../../../helpers/generate-jwt.js";
import { IHashService } from "../services/IHashService.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { UserNotActiveException } from "../exceptions/UserNotActiveException.js";
import { WrongCredentialsException } from "../exceptions/WrongCredentialsException.js";
export interface ILoginUserAction {
    execute: (credentials:{email:string, password:string}) => Promise<any>
}
export const LoginUserAction = (userRepository: IUserRepository, hashService: IHashService):ILoginUserAction => {
    return {
        execute(credentials) {
          return new Promise(async (resolve, reject) => {
            try {
              const user = await userRepository.getOne({email: credentials.email}, true)
              if (!user) throw new UserNotExistException()
              if (!user.status) throw new UserNotActiveException()
              const validPassword = hashService.compare(credentials.password, user.password);
              if (!validPassword) throw new WrongCredentialsException()
              const token = await generateJWT(user.id)
              const { password, ...userWithoutPassword } = user;
              resolve({
                user: userWithoutPassword,
                token
              })
            } catch (error) {
              reject(error)
            }
          })
        }
    }
}