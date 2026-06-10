import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IRefreshTokenRepository } from "../repository/IRefreshTokenRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";

export interface IDeactivateAccountAction {
  execute: (id: string) => Promise<{ id: string | number; status: boolean }>;
}

export const DeactivateAccountAction = (
  UserRepository: IUserRepository,
  refreshTokenRepository: IRefreshTokenRepository,
): IDeactivateAccountAction => {
  return {
    async execute(id) {
      const user = await UserRepository.getById(id);
      if (!user) {
        throw new UserNotExistException();
      }

      const userIdNum = Number((user as { id?: string | number }).id ?? id);
      if ((user as { status?: boolean }).status !== false) {
        await UserRepository.edit({ status: false } as never, id);
      }

      if (!Number.isNaN(userIdNum)) {
        await refreshTokenRepository.removeByUserId(userIdNum);
      }

      const updated = await UserRepository.getById(id);
      return {
        id: (updated as { id?: string | number })?.id ?? id,
        status: Boolean((updated as { status?: boolean })?.status === true),
      };
    },
  };
};
