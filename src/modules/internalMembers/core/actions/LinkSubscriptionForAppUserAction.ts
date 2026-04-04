import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";
import { ILinkSubscriptionAction } from "../../../users/core/actions/LinkSubscriptionAction.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { MemberConflictException } from "../exceptions/MemberConflictException.js";
import {
  MERCADOPAGO_STATUS,
  SUBSCRIPTION_STATUS,
} from "../domain/memberIntegrationStatuses.js";

export interface ILinkSubscriptionForAppUserAction {
  execute: (
    appUserId: string,
    body: { mpPreapprovalId: string },
    adminUserId: number
  ) => Promise<unknown>;
}

export const LinkSubscriptionForAppUserAction = (
  userRepository: IUserRepository,
  internalMemberRepository: IInternalMemberRepository,
  linkSubscription: ILinkSubscriptionAction,
  subscriptionPlanRepository: ISubscriptionPlanRepository
): ILinkSubscriptionForAppUserAction => ({
  async execute(appUserId, body, adminUserId) {
    const user = await userRepository.getById(appUserId);
    if (!user) throw new UserNotExistException();

    const mpPreapprovalId = body.mpPreapprovalId?.trim();
    if (!mpPreapprovalId) {
      throw new Error("mpPreapprovalId es obligatorio");
    }

    const preTaken = await internalMemberRepository.findByPreapprovalId(
      mpPreapprovalId
    );
    if (preTaken && preTaken.appUserId !== Number(appUserId)) {
      throw new MemberConflictException(
        "Este preapproval ya está vinculado a otro miembro"
      );
    }

    const email = (user as any).email as string;
    try {
      await linkSubscription.execute({
        suscriptionCode: mpPreapprovalId,
        email,
      });
    } catch (err: any) {
      let member = await internalMemberRepository.findByAppUserId(
        Number(appUserId)
      );
      if (!member) {
        member = await internalMemberRepository.createForAppUserId(
          Number(appUserId)
        );
      }
      await internalMemberRepository.updateByAppUserId(Number(appUserId), {
        mercadopagoStatus: MERCADOPAGO_STATUS.ERROR,
        lastMpError: err?.message ?? String(err),
      });
      await internalMemberRepository.appendAudit({
        internalMemberId: member.id,
        adminUserId,
        action: "link_subscription_error",
        payloadJson: { appUserId: Number(appUserId), error: String(err?.message) },
      });
      throw err;
    }

    const sub = await subscriptionPlanRepository.getOne({
      mpPreapprovalId: mpPreapprovalId,
    });
    const subJson = sub?.toJSON ? sub.toJSON() : sub;
    const subscriptionPlanId = subJson?.id as number | undefined;

    await internalMemberRepository.updateByAppUserId(Number(appUserId), {
      mercadopagoPreapprovalId: mpPreapprovalId,
      subscriptionPlanId: subscriptionPlanId ?? null,
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      mercadopagoStatus: MERCADOPAGO_STATUS.LINKED,
      lastMpError: null,
    });

    const updated = await internalMemberRepository.findByAppUserId(Number(appUserId));
    await internalMemberRepository.appendAudit({
      internalMemberId: updated?.id ?? null,
      adminUserId,
      action: "link_subscription",
      payloadJson: { appUserId: Number(appUserId), mpPreapprovalId },
    });
    return {
      user: await userRepository.getById(appUserId),
      internalMember: updated,
    };
  },
});
