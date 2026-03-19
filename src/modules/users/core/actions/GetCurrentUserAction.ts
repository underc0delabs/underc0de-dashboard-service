import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";

export interface IGetCurrentUserAction {
  execute: (userId: string) => Promise<any>;
}

export const GetCurrentUserAction = (
  UserRepository: IUserRepository,
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository,
): IGetCurrentUserAction => {
  return {
    async execute(userId: string) {
      const user = await UserRepository.getById(userId);
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
      const payments = subscription
        ? await PaymentRepository.get({ userSubscriptionId: (subData ?? subscription).id })
        : [];
      const n = (user.name ?? "").trim();
      const l = ((user as any).lastname ?? "").trim();
      const fullName = !l ? n : n === l ? n : n.endsWith(l) ? n : `${n} ${l}`.trim() || n;
      const isPro = !!(user as any).is_pro || (subData ?? subscription)?.status === "ACTIVE";
      return {
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
      };
    },
  };
};
