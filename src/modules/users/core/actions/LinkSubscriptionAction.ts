import { IUserRepository } from "../repository/IMongoUserRepository";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository";

export interface ILinkSubscriptionAction {
  execute: (body: { suscriptionCode: string; email: string }) => Promise<any>;
}

export const LinkSubscriptionAction = (
  UserRepository: IUserRepository,
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository
): ILinkSubscriptionAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const userResult = await UserRepository.get({ email: body.email });
          if (!userResult || !userResult.users || userResult.users.length === 0) {
            reject(new Error("User not found"));
            return;
          }

          const user = userResult.users[0];
          const userId = user.id;

          let subscription = await SubscriptionPlanRepository.getOne({
            mpPreapprovalId: body.suscriptionCode,
          });
          let subscriptionId: number;
          let updatedSubscription: any;

          if (!subscription) {
            const now = new Date();
            const nextPaymentDate = new Date(now);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

            const newSubscription = await SubscriptionPlanRepository.save({
              userId: userId,
              status: "ACTIVE",
              startedAt: now,
              nextPaymentDate: nextPaymentDate,
              mpPreapprovalId: body.suscriptionCode,
            } as any);

            const subscriptionData = (newSubscription as any).toJSON ? (newSubscription as any).toJSON() : newSubscription;
            subscriptionId = subscriptionData.id;
            updatedSubscription = subscriptionData;
          } else {
            const subscriptionData = subscription.toJSON ? subscription.toJSON() : subscription;
            subscriptionId = subscriptionData.id;

            await SubscriptionPlanRepository.edit(
              { userId: userId } as any,
              subscriptionId.toString()
            );

            updatedSubscription = await SubscriptionPlanRepository.getById(
              subscriptionId.toString()
            );
          }

          const updatedUser = {
            ...user,
            mpPayerId: body.suscriptionCode,
          };
          await UserRepository.edit(updatedUser, userId.toString());

          const paymentsResult = await PaymentRepository.get({
            userSubscriptionId: subscriptionId,
            page_count: 1000,
            page_number: 0,
          });
          const payments = paymentsResult?.payments || [];

          resolve({
            user: updatedUser,
            subscription: updatedSubscription,
            payments: payments,
          });
        } catch (error: any) {
          reject(error);
        }
      });
    },
  };
};
