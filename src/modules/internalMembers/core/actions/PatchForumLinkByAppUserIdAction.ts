import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";
import { MemberConflictException } from "../exceptions/MemberConflictException.js";
import {
  FORUM_STATUS,
} from "../domain/memberIntegrationStatuses.js";

export type ForumLinkBody = {
  forumUserId: string;
  forumEmail?: string | null;
};

export interface IPatchForumLinkByAppUserIdAction {
  execute: (
    appUserId: string,
    body: ForumLinkBody,
    adminUserId: number
  ) => Promise<unknown>;
}

/**
 * Vinculación foro v1: IDs ingresados por admin. La API pública del foro no expone
 * búsqueda por email sin token de sesión; la UI puede complementar más adelante.
 */
export const PatchForumLinkByAppUserIdAction = (
  userRepository: IUserRepository,
  internalMemberRepository: IInternalMemberRepository
): IPatchForumLinkByAppUserIdAction => ({
  async execute(appUserId, body, adminUserId) {
    const user = await userRepository.getById(appUserId);
    if (!user) throw new UserNotExistException();

    const forumUserId = body.forumUserId?.trim();
    if (!forumUserId) {
      throw new Error("forumUserId es obligatorio");
    }

    const existing = await internalMemberRepository.findByForumUserId(forumUserId);
    if (existing && existing.appUserId !== Number(appUserId)) {
      throw new MemberConflictException(
        "Este usuario del foro ya está vinculado a otro miembro"
      );
    }

    let member = await internalMemberRepository.findByAppUserId(Number(appUserId));
    if (!member) {
      member = await internalMemberRepository.createForAppUserId(Number(appUserId));
    }

    await internalMemberRepository.updateByAppUserId(Number(appUserId), {
      forumUserId,
      forumEmail: body.forumEmail?.trim() || null,
      forumStatus: FORUM_STATUS.LINKED,
      lastForumError: null,
    });

    const updated = await internalMemberRepository.findByAppUserId(Number(appUserId));
    await internalMemberRepository.appendAudit({
      internalMemberId: updated?.id ?? null,
      adminUserId,
      action: "patch_forum_link",
      payloadJson: { appUserId: Number(appUserId), forumUserId },
    });
    return updated;
  },
});
