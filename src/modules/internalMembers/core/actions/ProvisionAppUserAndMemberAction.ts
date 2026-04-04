import crypto from "crypto";
import { Transaction } from "sequelize";
import { sequelize } from "../../../../server/DbConnection.js";
import UserModel from "../../../users/infrastructure/models/UserModel.js";
import { IHashService } from "../../../users/core/services/IHashService.js";
import { IInternalMemberRepository } from "../repository/IInternalMemberRepository.js";
import { parseUserBirthday } from "../helpers/parseUserBirthday.js";

export type ProvisionBody = {
  username: string;
  name: string;
  lastname?: string;
  email: string;
  phone?: string;
  idNumber?: string;
  userType?: number;
  status?: boolean;
  birthday?: string | Date;
  password?: string;
};

export interface IProvisionAppUserAndMemberAction {
  execute: (
    body: ProvisionBody,
    adminUserId: number
  ) => Promise<{ user: Record<string, unknown>; internalMember: unknown }>;
}

export const ProvisionAppUserAndMemberAction = (
  hashService: IHashService,
  internalMemberRepository: IInternalMemberRepository
): IProvisionAppUserAndMemberAction => ({
  async execute(body, adminUserId) {
    const username = body.username?.trim();
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    if (!username || !name || !email) {
      throw new Error("username, name y email son obligatorios");
    }

    const birthday = parseUserBirthday(body.birthday);
    const password = hashService.hash(
      body.password?.trim() ||
        crypto.randomBytes(32).toString("hex")
    );

    const t: Transaction = await sequelize.transaction();
    try {
      const created = await UserModel.create(
        {
          username,
          name,
          lastname: body.lastname ?? "",
          phone: body.phone ?? "",
          email,
          idNumber: body.idNumber ?? "",
          userType: body.userType ?? 0,
          status: body.status ?? true,
          birthday,
          password,
          is_pro: false,
        },
        { transaction: t }
      );
      const userJson = created.toJSON() as Record<string, unknown>;
      const appUserId = userJson.id as number;
      const member = await internalMemberRepository.createForAppUserId(
        appUserId,
        t
      );
      await internalMemberRepository.appendAudit(
        {
          internalMemberId: member.id,
          adminUserId,
          action: "provision_app_user_and_member",
          payloadJson: { appUserId, email },
        },
        t
      );
      await t.commit();
      delete userJson.password;
      return { user: userJson, internalMember: member };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
});
