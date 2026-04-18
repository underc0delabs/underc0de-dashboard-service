import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";

export interface IGetMemberBundleByAppUserIdAction {
  execute: (
    appUserId: string
  ) => Promise<{
    user: unknown;
    internalMember: unknown;
    subscriptionPlans: unknown[];
    subscriptionPagination: unknown;
  }>;
}

export const GetMemberBundleByAppUserIdAction = (
  userRepository: IUserRepository,
  internalMemberRepository: IInternalMemberRepository,
  subscriptionPlanRepository: ISubscriptionPlanRepository
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

    const subsResult = await subscriptionPlanRepository.get({
      userId: Number(appUserId),
      page_count: 100,
      page_number: 0,
    });
    const raw = subsResult?.subscriptionPlans ?? [];
    const subscriptionPlans = raw.map((row: any) =>
      row?.toJSON ? row.toJSON() : row
    );

    return {
      user,
      internalMember: member,
      subscriptionPlans,
      subscriptionPagination: subsResult?.pagination ?? null,
    };
  },
});
