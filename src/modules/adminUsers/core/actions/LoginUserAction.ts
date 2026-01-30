import { IAdminUserRepository } from "../repository/IAdminUserRepository.js";
import generateJWT from "../../../../helpers/generate-jwt.js";
import { IHashService } from "../services/IHashService.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { UserNotActiveException } from "../exceptions/UserNotActiveException.js";
import { WrongCredentialsException } from "../exceptions/WrongCredentialsException.js";
export interface ILoginUserAction {
  execute: (credentials: { email: string; password: string }) => Promise<any>;
}
export const LoginUserAction = (
  adminUserRepository: IAdminUserRepository,
  hashService: IHashService
): ILoginUserAction => {
  return {
    execute(credentials) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await adminUserRepository.getOne({
            email: credentials.email,
          }, true);
          if (!user) throw new UserNotExistException();
          if (!user.status) throw new UserNotActiveException();
          const validPassword = hashService.compare(
            credentials.password,
            user.password
          );
          if (!validPassword) throw new WrongCredentialsException();
          const token = await generateJWT(user.id);
          resolve({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.rol,
              status: user.status,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            token,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
