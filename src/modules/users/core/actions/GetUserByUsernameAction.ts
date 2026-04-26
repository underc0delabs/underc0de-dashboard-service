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
  _subscriptionPlanRepository: ISubscriptionPlanRepository,
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
          const full = await UserRepository.getById(String(user.id));
          if (!full) throw new UserNotExistException();
          const sub: any = (full as any).subscription;
          const paymentsResult = sub
            ? await PaymentRepository.get({
                userSubscriptionId: sub.id,
                page_count: 20,
                page_number: 0,
              })
            : null;
          const payments = paymentsResult?.payments ?? [];
          const n = (full.name ?? "").trim();
          const l = ((full as any).lastname ?? "").trim();
          const fullName = !l ? n : n === l ? n : n.endsWith(l) ? n : `${n} ${l}`.trim() || n;
          resolve({
            id: full.id,
            username: full.username,
            name: full.name,
            lastname: full.lastname,
            fullName: fullName || n,
            phone: full.phone,
            email: full.email,
            idNumber: full.idNumber,
            userType: full.userType,
            birthday: full.birthday,
            vip: (full as any).vip,
            suscription: sub?.status ?? null,
            subscription: sub ?? null,
            status: full.status,
            fcmToken: full.fcmToken,
            mercadopago_email: (full as any).mercadopago_email ?? null,
            createdAt: full.createdAt,
            updatedAt: full.updatedAt,
            avatar: (full as any).avatar,
            payments: payments,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
