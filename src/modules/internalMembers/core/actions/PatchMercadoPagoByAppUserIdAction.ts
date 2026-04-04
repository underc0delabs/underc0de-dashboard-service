import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";
import { MemberConflictException } from "../exceptions/MemberConflictException.js";
import { MERCADOPAGO_STATUS } from "../domain/memberIntegrationStatuses.js";

export type MercadoPagoLinkBody = {
  mercadopagoEmail?: string | null;
  mercadopagoCustomerId?: string | null;
  mercadopagoPreapprovalId?: string | null;
  mercadopagoExternalReference?: string | null;
};

export interface IPatchMercadoPagoByAppUserIdAction {
  execute: (
    appUserId: string,
    body: MercadoPagoLinkBody,
      adminUserId: number
  ) => Promise<unknown>;
}

export const PatchMercadoPagoByAppUserIdAction = (
  userRepository: IUserRepository,
  internalMemberRepository: IInternalMemberRepository
): IPatchMercadoPagoByAppUserIdAction => ({
  async execute(appUserId, body, adminUserId) {
    const user = await userRepository.getById(appUserId);
    if (!user) throw new UserNotExistException();

    const pre = body.mercadopagoPreapprovalId?.trim();
    if (pre) {
      const taken = await internalMemberRepository.findByPreapprovalId(pre);
      if (taken && taken.appUserId !== Number(appUserId)) {
        throw new MemberConflictException(
          "Este preapproval_id ya está asociado a otro miembro"
        );
      }
    }

    let member = await internalMemberRepository.findByAppUserId(Number(appUserId));
    if (!member) {
      member = await internalMemberRepository.createForAppUserId(Number(appUserId));
    }

    const mercadopagoEmail = body.mercadopagoEmail?.trim() || null;
    await internalMemberRepository.updateByAppUserId(Number(appUserId), {
      mercadopagoEmail,
      mercadopagoCustomerId: body.mercadopagoCustomerId?.trim() || null,
      mercadopagoPreapprovalId: pre || null,
      mercadopagoExternalReference:
        body.mercadopagoExternalReference?.trim() || null,
      mercadopagoStatus: MERCADOPAGO_STATUS.LINKED,
      lastMpError: null,
    });

    if (mercadopagoEmail) {
      await userRepository.edit(
        { mercadopago_email: mercadopagoEmail } as any,
        appUserId
      );
    }

    const updated = await internalMemberRepository.findByAppUserId(Number(appUserId));
    await internalMemberRepository.appendAudit({
      internalMemberId: updated?.id ?? null,
      adminUserId,
      action: "patch_mercadopago",
      payloadJson: { appUserId: Number(appUserId), hasPreapproval: Boolean(pre) },
    });
    return updated;
  },
});
