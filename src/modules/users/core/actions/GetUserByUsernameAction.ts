import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";

export interface IGetUserByUsernameAction {
  execute: (username: string) => Promise<any>;
}

export const GetUserByUsernameAction = (
  UserRepository: IUserRepository,
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository,
): IGetUserByUsernameAction => {
  return {
    execute(username) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await UserRepository.getOne({ username: username });
          if (!user) throw new UserNotExistException();
          const subscription = await SubscriptionPlanRepository.getOne({ userId: user.id });
          const payments = subscription
            ? await PaymentRepository.get({ userSubscriptionId: subscription.id })
            : [];
          const n = (user.name ?? "").trim();
          const l = ((user as any).lastname ?? "").trim();
          const fullName = !l ? n : n.endsWith(l) ? n : `${n} ${l}`.trim() || n;
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
            vip: subscription?.status === "ACTIVE",
            suscription: subscription?.status ?? null,
            status: user.status,
            fcmToken: user.fcmToken,
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
