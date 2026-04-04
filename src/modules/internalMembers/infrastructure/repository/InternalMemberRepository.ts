import { Transaction } from "sequelize";
import {
  IInternalMemberRepository,
  InternalMemberRow,
} from "../../core/repository/IInternalMemberRepository.js";
import InternalMemberModel from "../models/InternalMemberModel.js";
import AdminMemberAuditModel from "../models/AdminMemberAuditModel.js";
import {
  FORUM_STATUS,
  MERCADOPAGO_STATUS,
  SUBSCRIPTION_STATUS,
} from "../../core/domain/memberIntegrationStatuses.js";

const toRow = (m: any): InternalMemberRow => {
  const j = m.toJSON ? m.toJSON() : m;
  return { ...j };
};

export const InternalMemberRepository = (): IInternalMemberRepository => ({
  async createForAppUserId(appUserId, transaction?) {
    const created = await InternalMemberModel.create(
      {
        appUserId,
        forumStatus: FORUM_STATUS.NOT_LINKED,
        mercadopagoStatus: MERCADOPAGO_STATUS.NOT_CONFIGURED,
        subscriptionStatus: SUBSCRIPTION_STATUS.NONE,
      },
      { transaction }
    );
    return toRow(created);
  },

  async findByAppUserId(appUserId) {
    const found = await InternalMemberModel.findOne({ where: { appUserId } });
    return found ? toRow(found) : null;
  },

  async findByForumUserId(forumUserId) {
    if (!forumUserId?.trim()) return null;
    const found = await InternalMemberModel.findOne({
      where: { forumUserId: forumUserId.trim() },
    });
    return found ? toRow(found) : null;
  },

  async findByPreapprovalId(preapprovalId) {
    if (!preapprovalId?.trim()) return null;
    const found = await InternalMemberModel.findOne({
      where: { mercadopagoPreapprovalId: preapprovalId.trim() },
    });
    return found ? toRow(found) : null;
  },

  async updateByAppUserId(appUserId, patch, transaction?) {
    const data: Record<string, unknown> = { ...patch };
    delete (data as any).id;
    delete (data as any).appUserId;
    deleteDataUndefined(data);
    await InternalMemberModel.update(data as any, {
      where: { appUserId },
      transaction,
    });
  },

  async appendAudit(input, transaction?) {
    await AdminMemberAuditModel.create(
      {
        internalMemberId: input.internalMemberId,
        adminUserId: input.adminUserId,
        action: input.action,
        payloadJson: input.payloadJson ?? null,
      },
      { transaction }
    );
  },
});

function deleteDataUndefined(data: Record<string, unknown>) {
  Object.keys(data).forEach((k) => {
    if (data[k] === undefined) delete data[k];
  });
}
