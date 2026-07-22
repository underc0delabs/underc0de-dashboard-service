import { Op } from "sequelize";
import InternalMemberModel from "../../../internalMembers/infrastructure/models/InternalMemberModel.js";
import UserModel from "../../../users/infrastructure/models/UserModel.js";
import { generateShareCode } from "../../core/helpers/publicProfile.js";
import UserConnectionModel, {
  CONNECTION_STATUS,
} from "../models/UserConnectionModel.js";
import UserFollowModel from "../models/UserFollowModel.js";

export type ConnectionRow = {
  id: string;
  requesterId: number;
  addresseeId: number;
  status: string;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FollowRow = {
  id: string;
  followerId: number;
  followingId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRow = {
  id: number;
  username: string;
  name: string;
  lastname: string | null;
  avatar: string | null;
  status: boolean;
  is_pro: boolean | null;
  shareCode: string | null;
  birthday?: string | null;
};

export type FriendBirthdayRow = {
  id: number;
  name: string;
  lastname: string | null;
  birthday: string;
  avatar: string | null;
};

const toConnectionRow = (row: { toJSON: () => unknown }): ConnectionRow =>
  row.toJSON() as ConnectionRow;

const toFollowRow = (row: { toJSON: () => unknown }): FollowRow =>
  row.toJSON() as FollowRow;

const toUserRow = (row: { toJSON: () => unknown }): UserRow =>
  row.toJSON() as UserRow;

const activeUserWhere = { status: true };

export const ConnectionRepository = () => ({
  async findUserById(userId: number): Promise<UserRow | null> {
    const user = await UserModel.findByPk(userId);
    return user ? toUserRow(user) : null;
  },

  async findActiveUserById(userId: number): Promise<UserRow | null> {
    const user = await UserModel.findOne({
      where: { id: userId, ...activeUserWhere },
    });
    return user ? toUserRow(user) : null;
  },

  async findUserByShareCode(shareCode: string): Promise<UserRow | null> {
    const user = await UserModel.findOne({
      where: { shareCode: shareCode.trim(), ...activeUserWhere },
    });
    return user ? toUserRow(user) : null;
  },

  async findActiveUserByForumMemberId(member: string): Promise<UserRow | null> {
    const forumUserId = member.trim();
    if (!forumUserId) return null;

    const internalMember = await InternalMemberModel.findOne({
      where: { forumUserId },
    });
    if (!internalMember) return null;

    const appUserId = Number((internalMember.toJSON() as { appUserId: number }).appUserId);
    if (!Number.isFinite(appUserId)) return null;

    return this.findActiveUserById(appUserId);
  },

  async getUserShareCode(userId: number): Promise<string | null> {
    const user = await UserModel.findByPk(userId, {
      attributes: ["shareCode"],
    });
    if (!user) return null;
    return (user.toJSON() as { shareCode: string | null }).shareCode;
  },

  async setUserShareCode(userId: number, shareCode: string): Promise<string> {
    await UserModel.update({ shareCode }, { where: { id: userId } });
    return shareCode;
  },

  async generateUniqueShareCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = generateShareCode();
      const existing = await UserModel.findOne({
        where: { shareCode: candidate },
        attributes: ["id"],
      });
      if (!existing) return candidate;
    }
    throw new Error("No se pudo generar un código de compartir único");
  },

  async findConnectionById(id: string): Promise<ConnectionRow | null> {
    const row = await UserConnectionModel.findByPk(id);
    return row ? toConnectionRow(row) : null;
  },

  async findDirectedConnection(
    requesterId: number,
    addresseeId: number,
  ): Promise<ConnectionRow | null> {
    const row = await UserConnectionModel.findOne({
      where: { requesterId, addresseeId },
    });
    return row ? toConnectionRow(row) : null;
  },

  async findAnyConnectionBetween(
    userAId: number,
    userBId: number,
  ): Promise<ConnectionRow | null> {
    const row = await UserConnectionModel.findOne({
      where: {
        [Op.or]: [
          { requesterId: userAId, addresseeId: userBId },
          { requesterId: userBId, addresseeId: userAId },
        ],
      },
    });
    return row ? toConnectionRow(row) : null;
  },

  async upsertPendingConnection(
    requesterId: number,
    addresseeId: number,
  ): Promise<ConnectionRow> {
    const existing = await this.findDirectedConnection(requesterId, addresseeId);
    if (existing) {
      await UserConnectionModel.update(
        {
          status: CONNECTION_STATUS.PENDING,
          respondedAt: null,
        },
        { where: { id: existing.id } },
      );
      return (await this.findConnectionById(existing.id)) as ConnectionRow;
    }

    const created = await UserConnectionModel.create({
      requesterId,
      addresseeId,
      status: CONNECTION_STATUS.PENDING,
    });
    return toConnectionRow(created);
  },

  async updateConnectionStatus(
    id: string,
    status: string,
    respondedAt: Date | null = new Date(),
  ): Promise<ConnectionRow | null> {
    await UserConnectionModel.update(
      { status, respondedAt },
      { where: { id } },
    );
    return this.findConnectionById(id);
  },

  async deleteConnection(id: string): Promise<void> {
    await UserConnectionModel.destroy({ where: { id } });
  },

  async upsertBlockConnection(
    blockerId: number,
    blockedId: number,
  ): Promise<ConnectionRow> {
    const existing = await this.findDirectedConnection(blockerId, blockedId);
    if (existing) {
      await UserConnectionModel.update(
        {
          status: CONNECTION_STATUS.BLOCKED,
          respondedAt: new Date(),
        },
        { where: { id: existing.id } },
      );
      return (await this.findConnectionById(existing.id)) as ConnectionRow;
    }

    const created = await UserConnectionModel.create({
      requesterId: blockerId,
      addresseeId: blockedId,
      status: CONNECTION_STATUS.BLOCKED,
      respondedAt: new Date(),
    });
    return toConnectionRow(created);
  },

  async isBlockedBetween(userAId: number, userBId: number): Promise<boolean> {
    const row = await UserConnectionModel.findOne({
      where: {
        status: CONNECTION_STATUS.BLOCKED,
        [Op.or]: [
          { requesterId: userAId, addresseeId: userBId },
          { requesterId: userBId, addresseeId: userAId },
        ],
      },
    });
    return Boolean(row);
  },

  async listFriends(userId: number): Promise<UserRow[]> {
    const connections = await UserConnectionModel.findAll({
      where: {
        status: CONNECTION_STATUS.ACCEPTED,
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    const friendIds = connections.map((c) => {
      const row = toConnectionRow(c);
      return row.requesterId === userId ? row.addresseeId : row.requesterId;
    });

    if (friendIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: { id: { [Op.in]: friendIds }, ...activeUserWhere },
      order: [["username", "ASC"]],
    });
    return users.map(toUserRow);
  },

  async listIncomingRequests(userId: number): Promise<
    Array<ConnectionRow & { requester: UserRow }>
  > {
    const rows = await UserConnectionModel.findAll({
      where: {
        addresseeId: userId,
        status: CONNECTION_STATUS.PENDING,
      },
      order: [["createdAt", "DESC"]],
    });

    const requesterIds = rows.map(
      (r) => toConnectionRow(r).requesterId,
    );
    if (requesterIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: { id: { [Op.in]: requesterIds }, ...activeUserWhere },
    });
    const userMap = new Map(users.map((u) => [Number(toUserRow(u).id), toUserRow(u)]));

    return rows
      .map((r) => {
        const connection = toConnectionRow(r);
        const requester = userMap.get(connection.requesterId);
        if (!requester) return null;
        return { ...connection, requester };
      })
      .filter(Boolean) as Array<ConnectionRow & { requester: UserRow }>;
  },

  async listOutgoingRequests(userId: number): Promise<
    Array<ConnectionRow & { addressee: UserRow }>
  > {
    const rows = await UserConnectionModel.findAll({
      where: {
        requesterId: userId,
        status: CONNECTION_STATUS.PENDING,
      },
      order: [["createdAt", "DESC"]],
    });

    const addresseeIds = rows.map(
      (r) => toConnectionRow(r).addresseeId,
    );
    if (addresseeIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: { id: { [Op.in]: addresseeIds }, ...activeUserWhere },
    });
    const userMap = new Map(users.map((u) => [Number(toUserRow(u).id), toUserRow(u)]));

    return rows
      .map((r) => {
        const connection = toConnectionRow(r);
        const addressee = userMap.get(connection.addresseeId);
        if (!addressee) return null;
        return { ...connection, addressee };
      })
      .filter(Boolean) as Array<ConnectionRow & { addressee: UserRow }>;
  },

  async createFollow(followerId: number, followingId: number): Promise<FollowRow> {
    const created = await UserFollowModel.create({ followerId, followingId });
    return toFollowRow(created);
  },

  async deleteFollow(followerId: number, followingId: number): Promise<boolean> {
    const deleted = await UserFollowModel.destroy({
      where: { followerId, followingId },
    });
    return deleted > 0;
  },

  async findFollow(
    followerId: number,
    followingId: number,
  ): Promise<FollowRow | null> {
    const row = await UserFollowModel.findOne({
      where: { followerId, followingId },
    });
    return row ? toFollowRow(row) : null;
  },

  async deleteFollowsBetween(userAId: number, userBId: number): Promise<void> {
    await UserFollowModel.destroy({
      where: {
        [Op.or]: [
          { followerId: userAId, followingId: userBId },
          { followerId: userBId, followingId: userAId },
        ],
      },
    });
  },

  async listFollowing(userId: number): Promise<UserRow[]> {
    const follows = await UserFollowModel.findAll({
      where: { followerId: userId },
      order: [["createdAt", "DESC"]],
    });
    const followingIds = follows.map((f) => toFollowRow(f).followingId);
    if (followingIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: { id: { [Op.in]: followingIds }, ...activeUserWhere },
    });
    const userMap = new Map(users.map((u) => [Number(toUserRow(u).id), toUserRow(u)]));
    return followingIds
      .map((id) => userMap.get(id))
      .filter(Boolean) as UserRow[];
  },

  async listFollowers(userId: number): Promise<UserRow[]> {
    const follows = await UserFollowModel.findAll({
      where: { followingId: userId },
      order: [["createdAt", "DESC"]],
    });
    const followerIds = follows.map((f) => toFollowRow(f).followerId);
    if (followerIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: { id: { [Op.in]: followerIds }, ...activeUserWhere },
    });
    const userMap = new Map(users.map((u) => [Number(toUserRow(u).id), toUserRow(u)]));
    return followerIds
      .map((id) => userMap.get(id))
      .filter(Boolean) as UserRow[];
  },

  async listFriendsBirthdays(userId: number): Promise<FriendBirthdayRow[]> {
    const connections = await UserConnectionModel.findAll({
      where: {
        status: CONNECTION_STATUS.ACCEPTED,
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    const friendIds = connections.map((c) => {
      const row = toConnectionRow(c);
      return row.requesterId === userId ? row.addresseeId : row.requesterId;
    });

    if (friendIds.length === 0) return [];

    const users = await UserModel.findAll({
      where: {
        id: { [Op.in]: friendIds },
        ...activeUserWhere,
        birthday: { [Op.ne]: null },
      },
      attributes: ["id", "name", "lastname", "birthday", "avatar"],
      order: [["name", "ASC"]],
    });

    return users
      .map((user) => {
        const row = user.toJSON() as {
          id: number;
          name: string;
          lastname: string | null;
          birthday: string | null;
          avatar: string | null;
        };
        if (!row.birthday) {
          return null;
        }
        return {
          id: row.id,
          name: row.name,
          lastname: row.lastname,
          birthday: row.birthday,
          avatar: row.avatar,
        };
      })
      .filter(Boolean) as FriendBirthdayRow[];
  },
});

export type IConnectionRepository = ReturnType<typeof ConnectionRepository>;
