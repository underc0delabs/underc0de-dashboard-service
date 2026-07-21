import { randomBytes, randomInt } from "crypto";
import { Op } from "sequelize";
import BingoEvent, {
  BINGO_EVENT_STATUS,
  type BingoEventStatus,
} from "../models/BingoEventModel.js";
import BingoStand from "../models/BingoStandModel.js";
import BingoParticipant from "../models/BingoParticipantModel.js";
import BingoParticipantToken from "../models/BingoParticipantTokenModel.js";
import BingoBoardEntry from "../models/BingoBoardEntryModel.js";
import BingoCheckin from "../models/BingoCheckinModel.js";
import BingoRaffleEntry from "../models/BingoRaffleEntryModel.js";
import BingoDraw from "../models/BingoDrawModel.js";
import Merchant from "../../../merchants/infrastructure/models/MerchantModel.js";
import {
  buildBingoEventMetrics,
  type BingoEventMetrics,
} from "../../core/domain/bingoEventMetrics.js";

export type BingoEventRow = {
  id: string;
  name: string;
  description: string | null;
  status: BingoEventStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdByAdminId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BingoStandRow = {
  id: string;
  bingoEventId: string;
  merchantId: string | null;
  code: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BingoParticipantRow = {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type BingoBoardEntryRow = {
  id: string;
  bingoEventId: string;
  participantId: string;
  joinedAt: Date;
  completedAt: Date | null;
};

const toJson = <T>(row: unknown): T =>
  (row as { toJSON: () => T }).toJSON();

const generateStandCode = () => randomBytes(4).toString("hex").toUpperCase();

export const BingoRepository = () => ({
  // Events
  async createEvent(data: {
    name: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    createdByAdminId: number | null;
  }): Promise<BingoEventRow> {
    const row = await BingoEvent.create({
      ...data,
      status: BINGO_EVENT_STATUS.DRAFT,
    });
    return toJson(row);
  },

  async findEventById(id: string): Promise<BingoEventRow | null> {
    const row = await BingoEvent.findByPk(id);
    return row ? toJson(row) : null;
  },

  async findActiveEvent(): Promise<BingoEventRow | null> {
    const row = await BingoEvent.findOne({
      where: { status: BINGO_EVENT_STATUS.ACTIVE },
      order: [["createdAt", "DESC"]],
    });
    return row ? toJson(row) : null;
  },

  async listEvents(): Promise<BingoEventRow[]> {
    const rows = await BingoEvent.findAll({ order: [["createdAt", "DESC"]] });
    return rows.map(r => toJson<BingoEventRow>(r));
  },

  async closeAllActiveEventsExcept(exceptId: string): Promise<number> {
    const [count] = await BingoEvent.update(
      { status: BINGO_EVENT_STATUS.CLOSED },
      {
        where: {
          status: BINGO_EVENT_STATUS.ACTIVE,
          id: { [Op.ne]: exceptId },
        },
      },
    );
    return count;
  },

  async updateEvent(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      status: BingoEventStatus;
      startDate: Date | null;
      endDate: Date | null;
    }>,
  ): Promise<BingoEventRow | null> {
    const row = await BingoEvent.findByPk(id);
    if (!row) {
      return null;
    }
    await row.update(data);
    return toJson(row);
  },

  async deleteEvent(id: string): Promise<boolean> {
    const count = await BingoEvent.destroy({ where: { id } });
    return count > 0;
  },

  // Stands
  async createStand(data: {
    bingoEventId: string;
    merchantId: string | null;
    label: string;
    code?: string;
  }): Promise<BingoStandRow> {
    const code = data.code?.trim() || generateStandCode();
    const row = await BingoStand.create({
      bingoEventId: data.bingoEventId,
      merchantId: data.merchantId,
      label: data.label,
      code,
    });
    return toJson(row);
  },

  async listStandsByEvent(bingoEventId: string): Promise<BingoStandRow[]> {
    const rows = await BingoStand.findAll({
      where: { bingoEventId },
      include: [{ model: Merchant, as: "merchant", attributes: ["id", "name", "logo"], required: false }],
      order: [["createdAt", "ASC"]],
    });
    return rows.map(r => toJson<BingoStandRow>(r));
  },

  async findStandById(id: string): Promise<BingoStandRow | null> {
    const row = await BingoStand.findByPk(id);
    return row ? toJson(row) : null;
  },

  async findStandByCode(
    bingoEventId: string,
    code: string,
  ): Promise<BingoStandRow | null> {
    const row = await BingoStand.findOne({ where: { bingoEventId, code } });
    return row ? toJson(row) : null;
  },

  async updateStand(
    id: string,
    data: Partial<{ label: string; merchantId: string | null }>,
  ): Promise<BingoStandRow | null> {
    const row = await BingoStand.findByPk(id);
    if (!row) {
      return null;
    }
    await row.update(data);
    return toJson(row);
  },

  async deleteStand(id: string): Promise<boolean> {
    const count = await BingoStand.destroy({ where: { id } });
    return count > 0;
  },

  // Participants
  async findParticipantByGoogleId(
    googleId: string,
  ): Promise<BingoParticipantRow | null> {
    const row = await BingoParticipant.findOne({ where: { googleId } });
    return row ? toJson(row) : null;
  },

  async findParticipantById(
    id: string,
  ): Promise<BingoParticipantRow | null> {
    const row = await BingoParticipant.findByPk(id);
    return row ? toJson(row) : null;
  },

  async createParticipant(data: {
    googleId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<BingoParticipantRow> {
    const row = await BingoParticipant.create(data);
    return toJson(row);
  },

  async updateParticipant(
    id: string,
    data: Partial<{ email: string; name: string | null; avatarUrl: string | null }>,
  ): Promise<BingoParticipantRow | null> {
    const row = await BingoParticipant.findByPk(id);
    if (!row) {
      return null;
    }
    await row.update(data);
    return toJson(row);
  },

  // Participant refresh tokens
  async createParticipantToken(data: {
    participantId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await BingoParticipantToken.create(data);
  },

  async findParticipantToken(token: string) {
    const row = await BingoParticipantToken.findOne({ where: { token } });
    return row
      ? toJson<{ id: number; participantId: string; token: string; expiresAt: Date }>(row)
      : null;
  },

  async deleteParticipantToken(token: string): Promise<void> {
    await BingoParticipantToken.destroy({ where: { token } });
  },

  // Board entries
  async findBoardEntry(
    bingoEventId: string,
    participantId: string,
  ): Promise<BingoBoardEntryRow | null> {
    const row = await BingoBoardEntry.findOne({
      where: { bingoEventId, participantId },
    });
    return row ? toJson(row) : null;
  },

  async createBoardEntry(
    bingoEventId: string,
    participantId: string,
  ): Promise<BingoBoardEntryRow> {
    const row = await BingoBoardEntry.create({
      bingoEventId,
      participantId,
      joinedAt: new Date(),
    });
    return toJson(row);
  },

  async markBoardEntryCompleted(id: string): Promise<void> {
    await BingoBoardEntry.update({ completedAt: new Date() }, { where: { id } });
  },

  async listBoardEntriesByEvent(bingoEventId: string) {
    const rows = await BingoBoardEntry.findAll({
      where: { bingoEventId },
      include: [
        { model: BingoParticipant, as: "participant", attributes: ["id", "name", "email", "avatarUrl"] },
      ],
      order: [["joinedAt", "ASC"]],
    });
    return rows.map(r =>
      toJson<
        BingoBoardEntryRow & {
          participant?: { id: string; name: string | null; email: string; avatarUrl: string | null };
        }
      >(r),
    );
  },

  // Checkins
  async findCheckin(boardEntryId: string, bingoStandId: string) {
    const row = await BingoCheckin.findOne({ where: { boardEntryId, bingoStandId } });
    return row ? toJson<{ id: string }>(row) : null;
  },

  async createCheckin(boardEntryId: string, bingoStandId: string): Promise<void> {
    await BingoCheckin.create({ boardEntryId, bingoStandId, checkedInAt: new Date() });
  },

  async listCheckedStandIds(boardEntryId: string): Promise<string[]> {
    const rows = await BingoCheckin.findAll({
      where: { boardEntryId },
      attributes: ["bingoStandId"],
    });
    return rows.map(r => toJson<{ bingoStandId: string }>(r).bingoStandId);
  },

  async countCheckins(boardEntryId: string): Promise<number> {
    return BingoCheckin.count({ where: { boardEntryId } });
  },

  // Raffle entries
  async hasRaffleEntry(bingoEventId: string, participantId: string): Promise<boolean> {
    const count = await BingoRaffleEntry.count({ where: { bingoEventId, participantId } });
    return count > 0;
  },

  async createRaffleEntry(bingoEventId: string, participantId: string): Promise<void> {
    await BingoRaffleEntry.create({ bingoEventId, participantId, enteredAt: new Date() });
  },

  async listRaffleEntryParticipantIds(bingoEventId: string): Promise<string[]> {
    const rows = await BingoRaffleEntry.findAll({
      where: { bingoEventId },
      attributes: ["participantId"],
    });
    return rows.map(r => toJson<{ participantId: string }>(r).participantId);
  },

  async countRaffleEntries(bingoEventId: string): Promise<number> {
    return BingoRaffleEntry.count({ where: { bingoEventId } });
  },

  // Draws
  async supersedeDraws(bingoEventId: string): Promise<void> {
    await BingoDraw.update(
      { superseded: true },
      { where: { bingoEventId, superseded: false } },
    );
  },

  async createDraw(data: {
    bingoEventId: string;
    winnerParticipantId: string;
    participantCount: number;
    drawnByAdminId: number | null;
  }) {
    const row = await BingoDraw.create({
      ...data,
      drawnAt: new Date(),
      superseded: false,
    });
    return toJson<{ id: string }>(row);
  },

  async listDrawsByEvent(bingoEventId: string) {
    const rows = await BingoDraw.findAll({
      where: { bingoEventId },
      include: [{ model: BingoParticipant, as: "winner", attributes: ["id", "name", "email"] }],
      order: [["drawnAt", "DESC"]],
    });
    return rows.map(r => toJson(r));
  },

  async getEventMetrics(
    bingoEventId: string,
    options?: { includeStandVisits?: boolean },
  ): Promise<BingoEventMetrics> {
    const stands = await BingoStand.findAll({
      where: { bingoEventId },
      attributes: ["id", "label"],
      order: [["createdAt", "ASC"]],
    });
    const standCount = stands.length;

    const [
      participantCount,
      completedCount,
      raffleEligibleCount,
      drawCount,
      totalCheckins,
      lastDrawRow,
    ] = await Promise.all([
      BingoBoardEntry.count({ where: { bingoEventId } }),
      BingoBoardEntry.count({
        where: { bingoEventId, completedAt: { [Op.not]: null } },
      }),
      BingoRaffleEntry.count({ where: { bingoEventId } }),
      BingoDraw.count({ where: { bingoEventId } }),
      BingoCheckin.count({
        include: [
          {
            model: BingoBoardEntry,
            as: "boardEntry",
            where: { bingoEventId },
            attributes: [],
            required: true,
          },
        ],
      }),
      BingoDraw.findOne({
        where: { bingoEventId },
        order: [["drawnAt", "DESC"]],
        include: [
          {
            model: BingoParticipant,
            as: "winner",
            attributes: ["name", "email"],
          },
        ],
      }),
    ]);

    const lastDrawJson = lastDrawRow ? toJson<any>(lastDrawRow) : null;
    const lastDraw = lastDrawJson
      ? {
          id: String(lastDrawJson.id),
          winnerName:
            lastDrawJson.winner?.name ??
            lastDrawJson.winner?.email ??
            "Participante",
          participantCount: Number(lastDrawJson.participantCount ?? 0),
          drawnAt: new Date(lastDrawJson.drawnAt),
          superseded: Boolean(lastDrawJson.superseded),
        }
      : null;

    let standVisits: BingoEventMetrics["standVisits"];
    if (options?.includeStandVisits && stands.length > 0) {
      standVisits = await Promise.all(
        stands.map(async (standRow) => {
          const stand = toJson<{ id: string; label: string }>(standRow);
          const visitCount = await BingoCheckin.count({
            where: { bingoStandId: stand.id },
          });
          const visitRate =
            participantCount > 0
              ? Math.round((visitCount / participantCount) * 1000) / 10
              : 0;
          return {
            standId: stand.id,
            label: stand.label,
            visitCount,
            visitRate,
          };
        }),
      );
    }

    return buildBingoEventMetrics({
      participantCount,
      completedCount,
      raffleEligibleCount,
      totalCheckins,
      standCount,
      drawCount,
      lastDraw,
      standVisits,
    });
  },

  pickRandomParticipant(participantIds: string[]): string {
    if (participantIds.length === 0) {
      throw new Error("No participants");
    }
    const index = randomInt(0, participantIds.length);
    return participantIds[index]!;
  },
});

export type IBingoRepository = ReturnType<typeof BingoRepository>;
