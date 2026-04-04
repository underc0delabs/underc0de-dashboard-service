import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";

export interface IGetMemberBundleByAppUserIdAction {
  execute: (
    appUserId: string
  ) => Promise<{ user: unknown; internalMember: unknown }>;
}

export const GetMemberBundleByAppUserIdAction = (
  userRepository: IUserRepository,
  internalMemberRepository: IInternalMemberRepository
): IGetMemberBundleByAppUserIdAction => ({
  async execute(appUserId) {
    const user = await userRepository.getById(appUserId);
    if (!user) {
      throw new UserNotExistException();
    }
    let member = await internalMemberRepository.findByAppUserId(Number(appUserId));
    if (!member) {
      member = await internalMemberRepository.createForAppUserId(Number(appUserId));
    }
    return { user, internalMember: member };
  },
});
