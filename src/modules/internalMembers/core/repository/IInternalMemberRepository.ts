import { Transaction } from "sequelize";

export type InternalMemberRow = {
  id: number;
  appUserId: number;
  forumUserId: string | null;
  forumEmail: string | null;
  mercadopagoEmail: string | null;
  mercadopagoCustomerId: string | null;
  mercadopagoPreapprovalId: string | null;
  mercadopagoExternalReference: string | null;
  subscriptionPlanId: number | null;
  forumStatus: string;
  mercadopagoStatus: string;
  subscriptionStatus: string;
  lastForumError: string | null;
  lastMpError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface IInternalMemberRepository {
  createForAppUserId: (
    appUserId: number,
    transaction?: Transaction
  ) => Promise<InternalMemberRow>;
  findByAppUserId: (
    appUserId: number
  ) => Promise<InternalMemberRow | null>;
  findByForumUserId: (forumUserId: string) => Promise<InternalMemberRow | null>;
  findByPreapprovalId: (
    preapprovalId: string
  ) => Promise<InternalMemberRow | null>;
  updateByAppUserId: (
    appUserId: number,
    patch: Partial<InternalMemberRow>,
    transaction?: Transaction
  ) => Promise<void>;
  appendAudit: (
    input: {
      internalMemberId: number | null;
      adminUserId: number;
      action: string;
      payloadJson?: object | null;
    },
    transaction?: Transaction
  ) => Promise<void>;
}
