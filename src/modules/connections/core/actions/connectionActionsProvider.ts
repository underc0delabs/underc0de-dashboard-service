import { UserNotActiveException } from "../../../users/core/exceptions/UserNotActiveException.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import {
  ConnectionConflictException,
  ConnectionNotFoundException,
  SelfActionException,
  UserBlockedException,
} from "../exceptions/ConnectionExceptions.js";
import {
  PublicProfile,
  toPublicProfile,
} from "../helpers/publicProfile.js";
import { CONNECTION_STATUS } from "../../infrastructure/models/UserConnectionModel.js";
import { IConnectionRepository } from "../../infrastructure/repository/ConnectionRepository.js";

export interface RelationshipContext {
  isFriend: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  incomingRequestId: string | null;
  outgoingRequestId: string | null;
  isBlocked: boolean;
  blockedByViewer: boolean;
  blockedByTarget: boolean;
}

export interface ResolveProfileResult extends PublicProfile {
  relationship?: RelationshipContext;
}

export interface FriendRequestItem {
  id: string;
  status: string;
  createdAt: Date;
  user: PublicProfile;
}

const parseMemberQuery = (member: string): string => {
  const trimmed = member.trim();
  if (trimmed.toUpperCase().startsWith("UNDERC0DE:")) {
    return trimmed.slice("UNDERC0DE:".length).trim();
  }
  return trimmed;
};

const assertActiveUser = async (
  repo: IConnectionRepository,
  userId: number,
) => {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new UserNotExistException();
  }
  if (!user.status) {
    throw new UserNotActiveException();
  }
  return user;
};

const assertNotSelf = (actorId: number, targetId: number) => {
  if (actorId === targetId) {
    throw new SelfActionException();
  }
};

const assertNotBlocked = async (
  repo: IConnectionRepository,
  actorId: number,
  targetId: number,
) => {
  if (await repo.isBlockedBetween(actorId, targetId)) {
    throw new UserBlockedException();
  }
};

export interface IConnectionActions {
  resolveProfile: (input: {
    shareCode?: string;
    member?: string;
    viewerId?: number | null;
  }) => Promise<ResolveProfileResult>;
  ensureShareCode: (userId: number) => Promise<{ shareCode: string }>;
  rotateShareCode: (userId: number) => Promise<{ shareCode: string }>;
  sendFriendRequest: (
    actorId: number,
    targetUserId: number,
  ) => Promise<{ id: string; status: string }>;
  acceptFriendRequest: (
    actorId: number,
    connectionId: string,
  ) => Promise<{ id: string; status: string }>;
  rejectFriendRequest: (
    actorId: number,
    connectionId: string,
  ) => Promise<{ id: string; status: string }>;
  cancelFriendRequest: (actorId: number, connectionId: string) => Promise<void>;
  listFriends: (actorId: number) => Promise<PublicProfile[]>;
  listIncomingRequests: (actorId: number) => Promise<FriendRequestItem[]>;
  listOutgoingRequests: (actorId: number) => Promise<FriendRequestItem[]>;
  followUser: (actorId: number, targetUserId: number) => Promise<{ id: string }>;
  unfollowUser: (actorId: number, targetUserId: number) => Promise<void>;
  listFollowing: (actorId: number) => Promise<PublicProfile[]>;
  listFollowers: (actorId: number) => Promise<PublicProfile[]>;
  blockUser: (
    actorId: number,
    targetUserId: number,
  ) => Promise<{ id: string; status: string }>;
  getRelationshipContext: (
    viewerId: number,
    targetId: number,
  ) => Promise<RelationshipContext>;
}

export const getConnectionActions = (
  connectionRepository: IConnectionRepository,
): IConnectionActions => {
  const getRelationshipContext = async (
    viewerId: number,
    targetId: number,
  ): Promise<RelationshipContext> => {
    const [
      anyConnection,
      outgoing,
      incoming,
      isFollowing,
      isFollowedBy,
      blockedByViewer,
      blockedByTarget,
    ] = await Promise.all([
      connectionRepository.findAnyConnectionBetween(viewerId, targetId),
      connectionRepository.findDirectedConnection(viewerId, targetId),
      connectionRepository.findDirectedConnection(targetId, viewerId),
      connectionRepository.findFollow(viewerId, targetId),
      connectionRepository.findFollow(targetId, viewerId),
      connectionRepository.findDirectedConnection(viewerId, targetId).then(
        (row) => row?.status === CONNECTION_STATUS.BLOCKED,
      ),
      connectionRepository.findDirectedConnection(targetId, viewerId).then(
        (row) => row?.status === CONNECTION_STATUS.BLOCKED,
      ),
    ]);

    const isFriend = anyConnection?.status === CONNECTION_STATUS.ACCEPTED;
    const isBlocked = Boolean(blockedByViewer || blockedByTarget);

    return {
      isFriend,
      isFollowing: Boolean(isFollowing),
      isFollowedBy: Boolean(isFollowedBy),
      incomingRequestId:
        incoming?.status === CONNECTION_STATUS.PENDING ? incoming.id : null,
      outgoingRequestId:
        outgoing?.status === CONNECTION_STATUS.PENDING ? outgoing.id : null,
      isBlocked,
      blockedByViewer: Boolean(blockedByViewer),
      blockedByTarget: Boolean(blockedByTarget),
    };
  };

  return {
    async resolveProfile({ shareCode, member, viewerId }) {
      let user = null;

      if (shareCode?.trim()) {
        user = await connectionRepository.findUserByShareCode(shareCode);
      } else if (member?.trim()) {
        user = await connectionRepository.findActiveUserByForumMemberId(
          parseMemberQuery(member),
        );
      }

      if (!user) {
        throw new UserNotExistException();
      }

      const profile = toPublicProfile(user);

      if (viewerId && viewerId !== user.id) {
        const relationship = await getRelationshipContext(viewerId, user.id);
        return { ...profile, relationship };
      }

      return profile;
    },

    async ensureShareCode(userId) {
      await assertActiveUser(connectionRepository, userId);

      const existing = await connectionRepository.getUserShareCode(userId);
      if (existing) {
        return { shareCode: existing };
      }

      const shareCode = await connectionRepository.generateUniqueShareCode();
      await connectionRepository.setUserShareCode(userId, shareCode);
      return { shareCode };
    },

    async rotateShareCode(userId) {
      await assertActiveUser(connectionRepository, userId);
      const shareCode = await connectionRepository.generateUniqueShareCode();
      await connectionRepository.setUserShareCode(userId, shareCode);
      return { shareCode };
    },

    async sendFriendRequest(actorId, targetUserId) {
      await assertActiveUser(connectionRepository, actorId);
      await assertActiveUser(connectionRepository, targetUserId);
      assertNotSelf(actorId, targetUserId);
      await assertNotBlocked(connectionRepository, actorId, targetUserId);

      const existing = await connectionRepository.findAnyConnectionBetween(
        actorId,
        targetUserId,
      );

      if (existing?.status === CONNECTION_STATUS.ACCEPTED) {
        throw new ConnectionConflictException("Ya son amigos");
      }

      if (existing?.status === CONNECTION_STATUS.BLOCKED) {
        throw new UserBlockedException();
      }

      const outgoing = await connectionRepository.findDirectedConnection(
        actorId,
        targetUserId,
      );
      if (outgoing?.status === CONNECTION_STATUS.PENDING) {
        throw new ConnectionConflictException("Ya enviaste una solicitud");
      }

      const incoming = await connectionRepository.findDirectedConnection(
        targetUserId,
        actorId,
      );
      if (incoming?.status === CONNECTION_STATUS.PENDING) {
        throw new ConnectionConflictException(
          "Este usuario ya te envió una solicitud",
        );
      }

      const connection = await connectionRepository.upsertPendingConnection(
        actorId,
        targetUserId,
      );
      return { id: connection.id, status: connection.status };
    },

    async acceptFriendRequest(actorId, connectionId) {
      await assertActiveUser(connectionRepository, actorId);

      const connection = await connectionRepository.findConnectionById(connectionId);
      if (!connection) {
        throw new ConnectionNotFoundException();
      }

      if (connection.addresseeId !== actorId) {
        throw new ConnectionConflictException("No podés aceptar esta solicitud");
      }

      if (connection.status !== CONNECTION_STATUS.PENDING) {
        throw new ConnectionConflictException("La solicitud no está pendiente");
      }

      await assertNotBlocked(
        connectionRepository,
        actorId,
        connection.requesterId,
      );

      const updated = await connectionRepository.updateConnectionStatus(
        connectionId,
        CONNECTION_STATUS.ACCEPTED,
      );
      return { id: updated!.id, status: updated!.status };
    },

    async rejectFriendRequest(actorId, connectionId) {
      await assertActiveUser(connectionRepository, actorId);

      const connection = await connectionRepository.findConnectionById(connectionId);
      if (!connection) {
        throw new ConnectionNotFoundException();
      }

      if (connection.addresseeId !== actorId) {
        throw new ConnectionConflictException("No podés rechazar esta solicitud");
      }

      if (connection.status !== CONNECTION_STATUS.PENDING) {
        throw new ConnectionConflictException("La solicitud no está pendiente");
      }

      const updated = await connectionRepository.updateConnectionStatus(
        connectionId,
        CONNECTION_STATUS.REJECTED,
      );
      return { id: updated!.id, status: updated!.status };
    },

    async cancelFriendRequest(actorId, connectionId) {
      await assertActiveUser(connectionRepository, actorId);

      const connection = await connectionRepository.findConnectionById(connectionId);
      if (!connection) {
        throw new ConnectionNotFoundException();
      }

      if (connection.requesterId !== actorId) {
        throw new ConnectionConflictException("No podés cancelar esta solicitud");
      }

      if (connection.status !== CONNECTION_STATUS.PENDING) {
        throw new ConnectionConflictException("La solicitud no está pendiente");
      }

      await connectionRepository.deleteConnection(connectionId);
    },

    async listFriends(actorId) {
      await assertActiveUser(connectionRepository, actorId);
      const users = await connectionRepository.listFriends(actorId);
      return users.map(toPublicProfile);
    },

    async listIncomingRequests(actorId) {
      await assertActiveUser(connectionRepository, actorId);
      const rows = await connectionRepository.listIncomingRequests(actorId);
      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt,
        user: toPublicProfile(row.requester),
      }));
    },

    async listOutgoingRequests(actorId) {
      await assertActiveUser(connectionRepository, actorId);
      const rows = await connectionRepository.listOutgoingRequests(actorId);
      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt,
        user: toPublicProfile(row.addressee),
      }));
    },

    async followUser(actorId, targetUserId) {
      await assertActiveUser(connectionRepository, actorId);
      await assertActiveUser(connectionRepository, targetUserId);
      assertNotSelf(actorId, targetUserId);
      await assertNotBlocked(connectionRepository, actorId, targetUserId);

      const existing = await connectionRepository.findFollow(actorId, targetUserId);
      if (existing) {
        throw new ConnectionConflictException("Ya seguís a este usuario");
      }

      const follow = await connectionRepository.createFollow(actorId, targetUserId);
      return { id: follow.id };
    },

    async unfollowUser(actorId, targetUserId) {
      await assertActiveUser(connectionRepository, actorId);
      assertNotSelf(actorId, targetUserId);
      await connectionRepository.deleteFollow(actorId, targetUserId);
    },

    async listFollowing(actorId) {
      await assertActiveUser(connectionRepository, actorId);
      const users = await connectionRepository.listFollowing(actorId);
      return users.map(toPublicProfile);
    },

    async listFollowers(actorId) {
      await assertActiveUser(connectionRepository, actorId);
      const users = await connectionRepository.listFollowers(actorId);
      return users.map(toPublicProfile);
    },

    async blockUser(actorId, targetUserId) {
      await assertActiveUser(connectionRepository, actorId);
      await assertActiveUser(connectionRepository, targetUserId);
      assertNotSelf(actorId, targetUserId);

      await connectionRepository.deleteFollowsBetween(actorId, targetUserId);

      const connection = await connectionRepository.upsertBlockConnection(
        actorId,
        targetUserId,
      );
      return { id: connection.id, status: connection.status };
    },

    getRelationshipContext,
  };
};
