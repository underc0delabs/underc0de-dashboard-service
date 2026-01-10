import { IUserRepository } from "../repository/IMongoUserRepository";
import { UserNotExistException } from "../exceptions/UserNotExistException";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository";

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
          const payments = await PaymentRepository.get({ userSubscriptionId: subscription.id });
          resolve({
            id: user.id,
            username: user.username,
            name: user.name,
            lastname: user.lastname,
            phone: user.phone,
            email: user.email,
            idNumber: user.idNumber,
            userType: user.userType,
            birthday: user.birthday,
            vip: subscription.status === "ACTIVE",
            suscription: subscription.status,
            status: user.status,
            fcmToken: user.fcmToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            avatar: user.avatar,
            payments: payments,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
