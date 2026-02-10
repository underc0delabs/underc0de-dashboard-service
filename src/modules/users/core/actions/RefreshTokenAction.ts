import crypto from "crypto";
import configs from "../../../../configs.js";
import generateJWT from "../../../../helpers/generate-jwt.js";
import { IRefreshTokenRepository } from "../repository/IRefreshTokenRepository.js";
import { IUserRepository } from "../repository/IMongoUserRepository.js";

export interface IRefreshTokenAction {
  execute: (body: { refreshToken: string }) => Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
}

export const RefreshTokenAction = (
  refreshTokenRepository: IRefreshTokenRepository,
  userRepository: IUserRepository
): IRefreshTokenAction => {
  return {
    async execute(body) {
      const token = body.refreshToken?.trim?.();
      if (!token) {
        throw new Error("refreshToken es requerido");
      }
      const record = await refreshTokenRepository.getByToken(token);
      if (!record) {
        throw new Error("Refresh token no válido");
      }
      if (new Date() > record.expiresAt) {
        await refreshTokenRepository.removeByToken(token);
        throw new Error("Refresh token expirado");
      }
      const user = await userRepository.getById(String(record.userId));
      if (!user || (user as any).status === false) {
        await refreshTokenRepository.removeByToken(token);
        throw new Error("Usuario no encontrado o inactivo");
      }
      const expiresInSeconds =
        (configs as any).access_token_expires_seconds ?? 900;
      const accessToken = await generateJWT(
        String((user as any).id),
        expiresInSeconds
      );
      await refreshTokenRepository.removeByToken(token);
      const newRefreshToken = crypto.randomBytes(32).toString("hex");
      const days = (configs as any).refresh_token_expires_days ?? 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      await refreshTokenRepository.save({
        userId: record.userId,
        token: newRefreshToken,
        expiresAt,
      });
      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: expiresInSeconds,
      };
    },
  };
};
