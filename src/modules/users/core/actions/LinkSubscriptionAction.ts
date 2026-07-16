import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { MercadoPagoGateway } from "../../../../services/mercadopagoService/core/gateway/mercadoPagoGateway.js";
import {
  isTerminalSubscriptionStatus,
  mapMpDetailStatusToModel,
} from "../../../subscriptionPlan/core/domain/subscriptionStatusPolicy.js";

export interface ILinkSubscriptionAction {
  execute: (body: {
    suscriptionCode: string;
    userId: string;
    email?: string;
  }) => Promise<any>;
}

const calculateNextPaymentDate = (detail: any): Date | null => {
  if (detail?.next_payment_date) return new Date(detail.next_payment_date);
  const recurring = detail?.auto_recurring;
  if (!recurring?.start_date) return null;

  const start = new Date(recurring.start_date);
  const freq = recurring.frequency || 1;
  const type = recurring.frequency_type || "months";
  const next = new Date(start);
  if (type === "months") next.setMonth(next.getMonth() + freq);
  if (type === "days") next.setDate(next.getDate() + freq);
  return next;
};

export const LinkSubscriptionAction = (
  UserRepository: IUserRepository,
  SubscriptionPlanRepository: ISubscriptionPlanRepository,
  PaymentRepository: IPaymentRepository,
  mercadoPagoGateway: MercadoPagoGateway
): ILinkSubscriptionAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const preapprovalId = body?.suscriptionCode?.trim?.();
          if (!preapprovalId) {
            reject(new Error("El código de suscripción es obligatorio"));
            return;
          }

          const userId = String(body.userId ?? "").trim();
          if (!userId) {
            reject(new Error("Usuario no autenticado"));
            return;
          }

          const user = await UserRepository.getById(userId);
          if (!user) {
            reject(new Error("User not found"));
            return;
          }

          const userEmail = String((user as any).email ?? "").trim().toLowerCase();
          const bodyEmail = body.email?.trim?.().toLowerCase();
          if (bodyEmail && userEmail && bodyEmail !== userEmail) {
            reject(
              new Error(
                "El email no coincide con el usuario autenticado"
              )
            );
            return;
          }

          const detail = await mercadoPagoGateway.getPreapprovalById(preapprovalId);
          if (!detail) {
            reject(
              new Error("No encontramos una suscripción con ese código en MercadoPago")
            );
            return;
          }

          const mappedStatus = mapMpDetailStatusToModel((detail as any).status);
          if (mappedStatus !== "ACTIVE" && mappedStatus !== "PENDING") {
            reject(
              new Error(
                "La suscripción no está activa en MercadoPago. Creá una suscripción nueva desde la app."
              )
            );
            return;
          }

          let subscription = await SubscriptionPlanRepository.getOne({
            mpPreapprovalId: preapprovalId,
          });

          if (subscription) {
            const subscriptionData = subscription.toJSON
              ? subscription.toJSON()
              : subscription;
            const st = String(subscriptionData.status ?? "");
            if (isTerminalSubscriptionStatus(st)) {
              reject(
                new Error(
                  "Ese preapproval ya está asociado a una suscripción cancelada o finalizada. Para volver a ser Pro, creá una suscripción nueva desde la app (no se puede reutilizar un plan cerrado)."
                )
              );
              return;
            }
            const linkedUserId = subscriptionData.userId;
            if (
              linkedUserId != null &&
              String(linkedUserId) !== String(userId)
            ) {
              reject(
                new Error("Ese código ya está vinculado a otro usuario")
              );
              return;
            }
          }

          const subscriptionPayload = {
            userId: Number(userId),
            status: mappedStatus,
            startedAt: new Date(
              (detail as any).date_created || new Date().toISOString()
            ),
            nextPaymentDate: calculateNextPaymentDate(detail),
            mpPreapprovalId: preapprovalId,
          };

          let subscriptionId: number;
          let updatedSubscription: any;

          if (!subscription) {
            const newSubscription = await SubscriptionPlanRepository.save(
              subscriptionPayload as any
            );
            const subscriptionData = (newSubscription as any).toJSON
              ? (newSubscription as any).toJSON()
              : newSubscription;
            subscriptionId = subscriptionData.id;
            updatedSubscription = subscriptionData;
          } else {
            const subscriptionData = subscription.toJSON
              ? subscription.toJSON()
              : subscription;
            subscriptionId = subscriptionData.id;
            await SubscriptionPlanRepository.edit(
              subscriptionPayload as any,
              subscriptionId.toString()
            );
            updatedSubscription = await SubscriptionPlanRepository.getById(
              subscriptionId.toString()
            );
            updatedSubscription = updatedSubscription?.toJSON
              ? updatedSubscription.toJSON()
              : updatedSubscription;
          }

          const payerId = (detail as any).payer_id;
          const updatedUser = {
            ...user,
            mpPayerId: payerId != null ? String(payerId) : (user as any).mpPayerId,
            is_pro: mappedStatus === "ACTIVE",
          };
          await UserRepository.edit(updatedUser, userId);

          const paymentsResult = await PaymentRepository.get({
            userSubscriptionId: subscriptionId,
            page_count: 1000,
            page_number: 0,
          });
          const payments = paymentsResult?.payments || [];

          resolve({
            user: updatedUser,
            subscription: updatedSubscription,
            payments,
          });
        } catch (error: any) {
          reject(error);
        }
      });
    },
  };
};
