import crypto from "crypto";
import configs from "../../../../configs.js";
import generateJWT from "../../../../helpers/generate-jwt.js";
import { IRefreshTokenRepository } from "../repository/IRefreshTokenRepository.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";
import { UserNotActiveException } from "../exceptions/UserNotActiveException.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { WrongCredentialsException } from "../exceptions/WrongCredentialsException.js";

export interface ILoginUserAction {
  execute: (credentials: { email: string; password: string }) => Promise<any>;
}

const getRefreshTokenExpiresAt = () => {
  const days = (configs as any).refresh_token_expires_days ?? 7;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

export const LoginUserAction = (
  userRepository: IUserRepository,
  hashService: IHashService,
  refreshTokenRepository: IRefreshTokenRepository
): ILoginUserAction => {
  return {
    execute(credentials) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await userRepository.getOne(
            { email: credentials.email },
            true
          );
          if (!user) throw new UserNotExistException();
          if (!user.status) throw new UserNotActiveException();
          const validPassword = hashService.compare(
            credentials.password,
            user.password
          );
          if (!validPassword) throw new WrongCredentialsException();

          const expiresInSeconds = (configs as any).access_token_expires_seconds ?? 900;
          const accessToken = await generateJWT(String(user.id), expiresInSeconds);
          const refreshToken = crypto.randomBytes(32).toString("hex");
          const expiresAt = getRefreshTokenExpiresAt();
          await refreshTokenRepository.save({
            userId: (user as any).id,
            token: refreshToken,
            expiresAt,
          });

          const { password, ...userWithoutPassword } = user;
          resolve({
            user: userWithoutPassword,
            accessToken,
            token: accessToken,
            refreshToken,
            expiresIn: expiresInSeconds,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};