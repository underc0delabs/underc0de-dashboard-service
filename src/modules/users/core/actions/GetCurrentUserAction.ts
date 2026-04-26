import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";

export interface IGetCurrentUserAction {
  execute: (userId: string) => Promise<any>;
}

export const GetCurrentUserAction = (
  UserRepository: IUserRepository,
  _SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository,
): IGetCurrentUserAction => {
  return {
    async execute(userId: string) {
      const user = await UserRepository.getById(userId);
      if (!user) throw new UserNotExistException();
      const sub: any = (user as any).subscription;
      const paymentsResult = sub
        ? await PaymentRepository.get({
            userSubscriptionId: sub.id,
            page_count: 20,
            page_number: 0,
          })
        : null;
      const payments = paymentsResult?.payments ?? [];
      const n = (user.name ?? "").trim();
      const l = ((user as any).lastname ?? "").trim();
      const fullName = !l ? n : n === l ? n : n.endsWith(l) ? n : `${n} ${l}`.trim() || n;
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
        vip: (user as any).vip,
        suscription: sub?.status ?? null,
        subscription: sub ?? null,
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
