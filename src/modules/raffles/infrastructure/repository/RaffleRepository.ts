import { randomInt } from "crypto";
import { Op } from "sequelize";
import User from "../../../users/infrastructure/models/UserModel.js";
import Raffle, {
  RAFFLE_STATUS,
  type RaffleStatus,
} from "../models/RaffleModel.js";
import RaffleParticipant from "../models/RaffleParticipantModel.js";
import RaffleDraw from "../models/RaffleDrawModel.js";
import RaffleEvent, {
  RAFFLE_EVENT_TYPE,
} from "../models/RaffleEventModel.js";

export type RaffleRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  participationDeadline: Date;
  claimDeadline: Date;
  proOnly: boolean;
  status: RaffleStatus;
  createdByAdminId: number | null;
  winnerUserId: number | null;
  currentDrawId: string | null;
  publishedAt: Date | null;
  visibleInApp: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ParticipantRow = {
  id: string;
  raffleId: string;
  userId: number;
  enteredAt: Date;
  user?: {
    id: number;
    name: string;
    username: string;
  };
};

export type EventRow = {
  id: string;
  raffleId: string;
  type: string;
  payload: Record<string, unknown> | null;
  actorType: string;
  actorId: string | null;
  createdAt: Date;
};

const toRaffleRow = (row: unknown): RaffleRow =>
  (row as { toJSON: () => RaffleRow }).toJSON();

const notDeletedWhere = { deletedAt: null };

export const RaffleRepository = () => ({
  async findById(id: string): Promise<RaffleRow | null> {
    const row = await Raffle.findOne({ where: { id, ...notDeletedWhere } });
    return row ? toRaffleRow(row) : null;
  },

  async listAll(): Promise<RaffleRow[]> {
    const rows = await Raffle.findAll({
      where: notDeletedWhere,
      order: [["createdAt", "DESC"]],
    });
    return rows.map(toRaffleRow);
  },

  async listForApp(_userId: number): Promise<RaffleRow[]> {
    const rows = await Raffle.findAll({
      where: {
        ...notDeletedWhere,
        visibleInApp: true,
        status: {
          [Op.in]: [
            RAFFLE_STATUS.PUBLISHED,
            RAFFLE_STATUS.CLOSED,
            RAFFLE_STATUS.DRAWN,
            RAFFLE_STATUS.COMPLETED,
            RAFFLE_STATUS.EXPIRED,
          ],
        },
      },
      order: [["participationDeadline", "ASC"]],
    });
    return rows.map(toRaffleRow);
  },

  async create(data: {
    title: string;
    description: string;
    imageUrl?: string | null;
    participationDeadline: Date;
    claimDeadline: Date;
    proOnly: boolean;
    createdByAdminId: number | null;
  }): Promise<RaffleRow> {
    const row = await Raffle.create({
      ...data,
      status: RAFFLE_STATUS.DRAFT,
    });
    return toRaffleRow(row);
  },

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      imageUrl: string | null;
      participationDeadline: Date;
      claimDeadline: Date;
      proOnly: boolean;
      status: RaffleStatus;
      winnerUserId: number | null;
      currentDrawId: string | null;
      publishedAt: Date | null;
      visibleInApp: boolean;
      deletedAt: Date | null;
    }>,
  ): Promise<RaffleRow | null> {
    const row = await Raffle.findOne({ where: { id, ...notDeletedWhere } });
    if (!row) {
      return null;
    }
    await row.update(data);
    return toRaffleRow(row);
  },

  async softDelete(id: string): Promise<boolean> {
    const row = await Raffle.findOne({ where: { id, ...notDeletedWhere } });
    if (!row) {
      return false;
    }
    await row.update({ deletedAt: new Date() });
    return true;
  },

  async countParticipants(raffleId: string): Promise<number> {
    return RaffleParticipant.count({ where: { raffleId } });
  },

  async hasParticipated(raffleId: string, userId: number): Promise<boolean> {
    const count = await RaffleParticipant.count({
      where: { raffleId, userId },
    });
    return count > 0;
  },

  async addParticipant(raffleId: string, userId: number): Promise<void> {
    await RaffleParticipant.create({
      raffleId,
      userId,
      enteredAt: new Date(),
    });
  },

  async listParticipants(raffleId: string): Promise<ParticipantRow[]> {
    const rows = await RaffleParticipant.findAll({
      where: { raffleId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username"],
        },
      ],
      order: [["enteredAt", "ASC"]],
    });
    return rows.map((r: { toJSON: () => ParticipantRow }) => r.toJSON());
  },

  async listParticipantUserIds(raffleId: string): Promise<number[]> {
    const rows = await RaffleParticipant.findAll({
      where: { raffleId },
      attributes: ["userId"],
    });
    return rows.map(
      (r: { toJSON: () => { userId: number } }) => r.toJSON().userId,
    );
  },

  async listForfeitedWinnerIds(raffleId: string): Promise<number[]> {
    const rows = await RaffleDraw.findAll({
      where: { raffleId, superseded: true },
      attributes: ["winnerUserId"],
    });
    return rows.map(
      (r: { toJSON: () => { winnerUserId: number } }) =>
        r.toJSON().winnerUserId,
    );
  },

  async getNextDrawNumber(raffleId: string): Promise<number> {
    const max = await RaffleDraw.max("drawNumber", { where: { raffleId } });
    return (typeof max === "number" ? max : 0) + 1;
  },

  async createDraw(data: {
    raffleId: string;
    drawNumber: number;
    winnerUserId: number;
    participantCount: number;
    drawnByAdminId: number | null;
  }) {
    const row = await RaffleDraw.create({
      ...data,
      drawnAt: new Date(),
      superseded: false,
    });
    return (row as { toJSON: () => Record<string, unknown> }).toJSON();
  },

  async supersedeDraws(raffleId: string): Promise<void> {
    await RaffleDraw.update(
      { superseded: true },
      { where: { raffleId, superseded: false } },
    );
  },

  async addEvent(data: {
    raffleId: string;
    type: string;
    payload?: Record<string, unknown> | null;
    actorType?: string;
    actorId?: string | null;
  }): Promise<EventRow> {
    const row = await RaffleEvent.create({
      raffleId: data.raffleId,
      type: data.type,
      payload: data.payload ?? null,
      actorType: data.actorType ?? "system",
      actorId: data.actorId ?? null,
    });
    return (row as { toJSON: () => EventRow }).toJSON();
  },

  async listEvents(raffleId: string): Promise<EventRow[]> {
    const rows = await RaffleEvent.findAll({
      where: { raffleId },
      order: [["createdAt", "ASC"]],
    });
    return rows.map((r: { toJSON: () => EventRow }) => r.toJSON());
  },

  async getLatestEvent(
    raffleId: string,
    type: string,
  ): Promise<EventRow | null> {
    const row = await RaffleEvent.findOne({
      where: { raffleId, type },
      order: [["createdAt", "DESC"]],
    });
    return row ? (row as { toJSON: () => EventRow }).toJSON() : null;
  },

  async findUserById(userId: number) {
    const row = await User.findByPk(userId);
    if (!row) {
      return null;
    }
    return (row as { toJSON: () => Record<string, unknown> }).toJSON() as {
      id: number;
      name: string;
      username: string;
      status: boolean;
      is_pro: boolean;
    };
  },

  pickRandomParticipant(userIds: number[]): number {
    if (userIds.length === 0) {
      throw new Error("No participants");
    }
    const index = randomInt(0, userIds.length);
    return userIds[index]!;
  },
});

export type IRaffleRepository = ReturnType<typeof RaffleRepository>;
