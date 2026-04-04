import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { IInternalMemberRepository } from "../../../internalMembers/core/repository/IInternalMemberRepository.js";
import { normalizeUserLookupWhitespace } from "../../../../helpers/userLookupNormalize.js";

export type GetByUsernameOptions = {
  /** Email del foro: si no hay match por usuario o id foro, se intenta por email en la app. */
  email?: string | null;
};

export interface IGetUserByUsernameAction {
  execute: (
    usernameOrForumKey: string,
    options?: GetByUsernameOptions
  ) => Promise<any>;
}

export const GetUserByUsernameAction = (
  UserRepository: IUserRepository,
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository,
  internalMemberRepository: IInternalMemberRepository
): IGetUserByUsernameAction => {
  return {
    execute(usernameOrForumKey, options) {
      return new Promise(async (resolve, reject) => {
        try {
          const key =
            normalizeUserLookupWhitespace(usernameOrForumKey ?? "") ||
            (usernameOrForumKey ?? "").trim();
          const emailOpt = options?.email?.trim() ?? "";
          let user: any = null;
          if (emailOpt) {
            user = await UserRepository.getOneByEmailIgnoreCase(emailOpt);
          }
          if (!user && key) {
            user = await UserRepository.getOneByUsernameIgnoreCase(key);
          }
          if (!user && key) {
            const member = await internalMemberRepository.findByForumUserId(key);
            if (member) {
              user = await UserRepository.getById(String(member.appUserId));
            }
          }
          if (!user && key) {
            user = await UserRepository.getOneByUsernameAccentFoldIgnoreCase(key);
          }
          if (!user) throw new UserNotExistException();
          const result = await SubscriptionPlanRepository.get({
            userId: user.id,
            status: "ACTIVE",
            page_count: 1,
            page_number: 0,
          });
          const plans = result?.subscriptionPlans ?? [];
          const subscription = Array.isArray(plans) ? plans[0] : null;
          const subData = subscription?.toJSON ? subscription.toJSON() : subscription;
          const subId = (subData ?? subscription)?.id;
          const paymentsResult = subscription && subId
            ? await PaymentRepository.get({
                userSubscriptionId: subId,
                page_count: 10,
                page_number: 0,
              })
            : null;
          const payments = paymentsResult?.payments ?? [];
          const n = (user.name ?? "").trim();
          const l = ((user as any).lastname ?? "").trim();
          const fullName = !l ? n : n === l ? n : n.endsWith(l) ? n : `${n} ${l}`.trim() || n;
          const isPro = !!(user as any).is_pro || (subData ?? subscription)?.status === "ACTIVE";
          resolve({
            id: user.id,
            username: user.username,
            name: user.name,
            lastname: user.lastname,
            fullName: fullName || n,
            phone: user.phone,
            email: user.email,
            idNumber: user.idNumber,
            userType: user.userType,
            birthday: user.birthday,
            vip: isPro,
            suscription: (subData ?? subscription)?.status ?? null,
            status: user.status,
            fcmToken: user.fcmToken,
            mercadopago_email: (user as any).mercadopago_email ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            avatar: (user as any).avatar,
            payments: payments,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
